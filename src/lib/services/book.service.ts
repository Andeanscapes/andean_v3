/**
 * Booking Service
 *
 * Pattern: Fetch → Validate → Translate → Return
 *
 * The feed is v2: stable domain codes, no copy. Two pure steps sit between the
 * payload and the UI:
 *
 *   1. `adaptExperienceFeedV2` resolves every domain code to an i18n **key**
 *      and restores the field names the booking flow persists.
 *   2. The projectors in `src/utils/experienceTranslators.ts` run `t` over that
 *      shape to produce the UI-ready content sections.
 *
 * Keeping both steps pure means this file only orchestrates.
 */

import { cache } from 'react';
import type { ExperienceData } from '../schemas';
import { ExperienceDataSchema } from '../schemas';
import type { ExperienceFeedV2 } from '../schemas/feed/v2';
import { ExperienceFeedV2Schema } from '../schemas/feed/v2';
import { EXPERIENCE_I18N } from '@/i18n/mappings/experience';
import { filterCurrentAvailableDates } from '@/utils/availability';
import { adaptExperienceFeedV2 } from '@/utils/experienceFeedAdapter';
import { experienceFeedPath } from '@/utils/feedPaths';
import { resolveMediaUrlsDeep } from '@/utils/mediaUrl';
import { whatsappUrl } from '@/utils/whatsapp';
import { getTranslations } from 'next-intl/server';
import { fetchRemoteJson } from '../remote-data';
import {
  toTranslatedConfig,
  toHeroContent,
  toWidgetContent,
  toValuePropositionsContent,
  toInclusionsContent,
  toItineraryContent,
  toAccommodationTiersContent,
  toAddonsContent,
  toHostContent,
} from '@/utils/experienceTranslators';

/** next-intl server `t` signature */
type Translator = (key: string, values?: Record<string, string | number>) => string;

type MappedExperienceId = keyof typeof EXPERIENCE_I18N;

/**
 * The feed's `experience.id` is a closed enum, so an unpublished experience
 * fails schema validation upstream. This guard covers the remaining gap: an id
 * that is valid in the feed but has no frontend mapping yet, which would
 * otherwise surface as untranslated keys in the UI.
 */
function mappingFor(experienceId: string): (typeof EXPERIENCE_I18N)[MappedExperienceId] {
  const mapping = EXPERIENCE_I18N[experienceId as MappedExperienceId];

  if (!mapping) {
    throw new Error(
      `[BookingService] No i18n mapping for experience "${experienceId}". ` +
        'Add it to src/i18n/mappings/experience.ts before publishing the feed entry.',
    );
  }

  return mapping;
}

/**
 * WhatsApp deep link with a localized prefill message.
 *
 * The v1 feed shipped this URL. v2 does not — a contact channel and a localized
 * message are frontend concerns, so the number comes from `SiteConfig` and the
 * copy from the `BookingCtas` namespace.
 */
function buildWhatsappLink(t: Translator): string {
  return whatsappUrl(t('BookingCtas.whatsappMiningQuote'));
}

/**
 * Fetch and translate experience data for the booking SSR page.
 *
 * Wrapped in React `cache`, keyed by `(experienceId, locale)`. Caching the feed
 * read alone was not enough: the detail and booking pages each call this twice —
 * once from `generateMetadata`, once from the page body — and the work *after*
 * the fetch dominates. Every call ran the adapter, a full `resolveMediaUrlsDeep`
 * walk over the payload, the whole translate pass and two Zod parses. That is
 * CPU, which is the constrained resource on Workers.
 *
 * `cache` is inert outside a request scope, so tests still re-run the pipeline on
 * every call and can stub a different feed per assertion.
 */
export const getBookingDataSSR = cache(async (
  experienceId: string,
  locale: string,
): Promise<ExperienceData> => {
  // 1. Fetch the v2 feed (throws if unavailable — no local fallback)
  const [t, feed] = await Promise.all([
    getTranslations({ locale }),
    fetchRawExperienceData(experienceId),
  ]);

  // 2. Resolve codes → i18n keys, restoring the persisted field names
  const mapping = mappingFor(feed.experience.id);
  const rawData = resolveMediaUrlsDeep(
    adaptExperienceFeedV2(feed, mapping, buildWhatsappLink(t)),
  );

  const rawResult = ExperienceDataSchema.safeParse(rawData);
  if (!rawResult.success) {
    console.error(`[BookingService] Adapter output invalid for "${experienceId}":`, rawResult.error.format());
    throw new Error(`[BookingService] Invalid adapted data for experience: ${experienceId}`);
  }

  // 3. Translate — each projector handles one content section
  const translated: ExperienceData = {
    ...rawResult.data,
    config: toTranslatedConfig(rawResult.data, t),
    transportOptions: rawResult.data.transportOptions.map((option) => ({
      ...option,
      label: t(option.label),
      description: option.description ? t(option.description) : undefined,
    })),
    roomModes: rawResult.data.roomModes.map((mode) => ({ ...mode, label: t(mode.label) })),
    heroContent: toHeroContent(rawResult.data, t, rawResult.data.config.depositPercent),
    widgetContent: toWidgetContent(t, rawResult.data.config.reviewsCount ?? 0),
    valuePropositionsContent: toValuePropositionsContent(rawResult.data, t),
    inclusionsContent: toInclusionsContent(rawResult.data, t),
    itineraryContent: toItineraryContent(rawResult.data, t),
    accommodationTiersContent: toAccommodationTiersContent(rawResult.data, t),
    addonsContent: toAddonsContent(rawResult.data, t),
    hostContent: toHostContent(rawResult.data, t),
  };

  const translatedResult = ExperienceDataSchema.safeParse(translated);
  if (!translatedResult.success) {
    console.error(`[BookingService] Translated data validation failed for "${experienceId}":`, translatedResult.error.format());
    throw new Error(`[BookingService] Invalid translated data for experience: ${experienceId}`);
  }

  return translatedResult.data;
});

// ── Fetch the raw v2 experience feed ─────────────────────────────────────────
//
// To add a new experience: publish `experience-<kebab-id>.json` to the feed, add
// a matching entry to `experiences-list.json`, and add its i18n mapping to
// `src/i18n/mappings/experience.ts`.

/**
 * Wrapped in React `cache` so it resolves once per request, keyed by
 * `experienceId`. The detail and booking pages each reach this twice — once from
 * `generateMetadata`, once from the page body — and this is the largest payload
 * in the feed, so re-running `response.json()` plus a full Zod parse was the
 * most expensive of the duplicated reads.
 *
 * Memoizing also makes `filterCurrentAvailableDates` consistent within a
 * request: both callers now see the same availability snapshot rather than
 * re-evaluating the clock. `cache` is inert outside a request scope, so tests
 * with faked timers still re-evaluate on every call.
 */
export const fetchRawExperienceData = cache(
  async (experienceId: string): Promise<ExperienceFeedV2> => {
    const remote = await fetchRemoteJson(experienceFeedPath(experienceId), ExperienceFeedV2Schema, {
      revalidate: 3600,
      tags: [`experience-${experienceId}`],
    });

    if (!remote.data) {
      throw new Error(
        `[BookingService] Experience feed unavailable for "${experienceId}": ${remote.reason}`,
      );
    }

    // The feed carries a fixed departure list, so expired dates are dropped here.
    return {
      ...remote.data,
      availableDates: filterCurrentAvailableDates(remote.data.availableDates),
    };
  },
);
