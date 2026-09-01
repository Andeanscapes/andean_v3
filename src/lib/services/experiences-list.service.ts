import type { ExperienceListCard, ExperiencesListData } from '../schemas';
import { ExperiencesListDataSchema } from '../schemas';
import type { ExperiencesListEntryV2, ExperiencesListFeedV2 } from '../schemas/feed/v2';
import { ExperiencesListFeedV2Schema } from '../schemas/feed/v2';
import { cache } from 'react';
import { getTranslations } from 'next-intl/server';
import { fetchRemoteJson } from '../remote-data';
import { EXPERIENCES_LIST_FEED_PATH } from '@/utils/feedPaths';
import { EXPERIENCE_I18N } from '@/i18n/mappings/experience';
import { EXPERIENCES_LIST_I18N } from '@/i18n/mappings/experiences-list';
import { resolveMediaUrlsDeep } from '@/utils/mediaUrl';
import { experiencePath } from '@/utils/experienceRoutes';

/**
 * Fetch and translate experiences list for SSR.
 * Pattern: Fetch -> Validate -> Translate -> Return
 *
 * The feed carries only stable domain codes; every user-facing string is
 * resolved from `src/i18n/mappings/*` against the locale bundles. Nothing in
 * the payload is passed to `t()`.
 *
 * Card prices come from the feed's `card.fromPrice` projection, which
 * `contract.test.ts` asserts equals the price the booking flow charges. The
 * list therefore renders from a single fetch — no per-card fan-out.
 */

// next-intl server `t` signature
type Translator = (key: string, values?: Record<string, string | number>) => string;

/**
 * Source-controlled hero background, used until the feed publishes `media.hero`.
 *
 * Mirrors the `/assets/...` fallbacks in `landing.structure.ts`: presentation
 * lives in source control, business media comes from the feed. Remove once the
 * published payload carries the field and the schema is tightened to required.
 */
const FALLBACK_HERO_IMAGE = '/assets/images/hero/h10.webp';

/**
 * Fetch and validate the raw list feed.
 *
 * Locale-agnostic and shared: experiences-catalog.service derives route and SEO
 * metadata from the same payload, so there is a single experiences feed rather
 * than a separate catalog endpoint.
 *
 * Wrapped in React `cache` so it resolves **once per request**. A single page
 * render reaches this through several entry points — `generateMetadata`, the
 * page body, and the catalog service — and while Next's fetch cache already
 * spares the network, every call still re-ran `response.json()` and a full Zod
 * parse of the whole payload. That is CPU, which is the constrained resource on
 * Workers.
 *
 * `cache` is inert outside a request scope, so tests still observe one fetch per
 * call and can stub the feed per assertion.
 */
export const fetchExperiencesListConfig = cache(
  async (): Promise<ExperiencesListFeedV2> => {
    const remote = await fetchRemoteJson(EXPERIENCES_LIST_FEED_PATH, ExperiencesListFeedV2Schema, {
      revalidate: 3600,
      tags: ['experiences-list'],
    });

    if (!remote.data) {
      throw new Error(`[ExperiencesList] Experiences feed unavailable: ${remote.reason}`);
    }

    return remote.data;
  },
);

/** Only published experiences are routable or listable. */
export function isPublished(entry: ExperiencesListEntryV2): boolean {
  return entry.status === 'published';
}

/**
 * Card metadata chips, in priority order: duration, departure locality, then
 * feed-selected highlights. Capped at 3 to match `ExperienceListCardSchema`.
 */
function toCardMetadata(entry: ExperiencesListEntryV2, t: Translator): string[] {
  const { duration, location, highlightCodes } = entry.card;

  return [
    t(EXPERIENCES_LIST_I18N.cardMeta.duration, {
      days: duration.days,
      nights: duration.nights,
    }),
    t(EXPERIENCES_LIST_I18N.cardMeta.startsIn, { locality: location.locality }),
    ...highlightCodes.map((code) => t(EXPERIENCES_LIST_I18N.highlights[code])),
  ].slice(0, 3);
}

function toCard(entry: ExperiencesListEntryV2, t: Translator): ExperienceListCard {
  // Keyed by the feed's experience id, never string-built from it. `id` is a
  // closed enum in the v2 schema, so an unmapped experience fails validation
  // upstream rather than rendering an untranslated key here.
  const mapping = EXPERIENCE_I18N[entry.id];
  const { card } = entry;

  return {
    id: entry.slug,
    title: t(mapping.title),
    description: t(mapping.description),
    image: card.image,
    price: card.fromPrice.amount,
    currency: card.fromPrice.currency,
    priceQualifier: t(EXPERIENCES_LIST_I18N.page.priceQualifier),
    metadata: toCardMetadata(entry, t),
    href: experiencePath(entry.slug),
    tag: card.badgeCode ? t(EXPERIENCES_LIST_I18N.badges[card.badgeCode]) : undefined,
  };
}

/**
 * Page chrome. The v2 feed carries no hero or section copy — it is frontend-owned
 * and lives in the `ExperiencesList` namespace.
 *
 * `ctaTargetId` matches the section id rendered by the experiences page.
 */
function toHeroContent(
  t: Translator,
  media: ExperiencesListFeedV2['media'],
): ExperiencesListData['hero'] {
  return {
    title: t('ExperiencesList.hero.title'),
    subtitle: t('ExperiencesList.hero.subtitle'),
    summary: t('ExperiencesList.hero.summary'),
    highlightText: t('ExperiencesList.hero.highlightText'),
    ctaLabel: t('ExperiencesList.hero.ctaLabel'),
    helperText: t('ExperiencesList.hero.helperText'),
    hideCta: false,
    ctaTargetId: 'experiences-cards',
    backgroundImageUrl: media?.hero ?? FALLBACK_HERO_IMAGE,
    video: media?.video,
    badges: [
      { label: t('ExperiencesList.hero.badges.nature'), icon: 'none' },
      { label: t('ExperiencesList.hero.badges.culture'), icon: 'none' },
      { label: t('ExperiencesList.hero.badges.hosted'), icon: 'none' },
    ],
  };
}

/**
 * Wrapped in React `cache`, keyed by `locale`. `generateMetadata` and the page
 * body both call this, and the translate pass plus the media walk cost more than
 * the feed read that `fetchExperiencesListConfig` already memoizes.
 *
 * `cache` is inert outside a request scope, so tests are unaffected.
 */
export const getExperiencesListSSR = cache(async (
  locale: string,
): Promise<ExperiencesListData> => {
  const [t, feed] = await Promise.all([
    getTranslations({ locale }),
    fetchExperiencesListConfig(),
  ]);

  const { page } = EXPERIENCES_LIST_I18N;

  // Resolve CDN-relative media (card images, hero video) to absolute URLs on the
  // feed, before translating — the same point in the pipeline as landing.service
  // and book.service, and it keeps translated copy out of the media walk.
  const resolvedFeed = resolveMediaUrlsDeep(feed);

  const translated: ExperiencesListData = {
    metaTitle: t(page.metaTitle),
    metaDescription: t(page.metaDescription),
    sectionTitle: t(page.sectionTitle),
    sectionSubtitle: t(page.sectionSubtitle),
    fromLabel: t(page.fromLabel),
    viewDetails: t(page.viewDetails),
    hero: toHeroContent(t, resolvedFeed.media),
    cards: resolvedFeed.experiences.filter(isPublished).map((entry) => toCard(entry, t)),
  };

  const translatedResult = ExperiencesListDataSchema.safeParse(translated);
  if (!translatedResult.success) {
    console.error('[ExperiencesList] Translated data validation failed:', translatedResult.error.format());
    throw new Error('[ExperiencesList] Invalid translated list data');
  }

  return translatedResult.data;
});
