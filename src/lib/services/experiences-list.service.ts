import type { ExperienceListCard, ExperiencesListData } from '../schemas';
import { ExperiencesListDataSchema } from '../schemas';
import type { ExperiencesListEntryV2, ExperiencesListFeedV2 } from '../schemas/feed/v2';
import { ExperiencesListFeedV2Schema } from '../schemas/feed/v2';
import { getTranslations } from 'next-intl/server';
import { fetchRemoteJson } from '../remote-data';
import { EXPERIENCES_LIST_FEED_PATH } from '@/utils/feedPaths';
import { EXPERIENCE_I18N } from '@/i18n/mappings/experience';
import { EXPERIENCES_LIST_I18N } from '@/i18n/mappings/experiences-list';
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
 * Fetch and validate the raw list feed.
 *
 * Locale-agnostic and shared: experiences-catalog.service derives route and SEO
 * metadata from the same payload, so there is a single experiences feed rather
 * than a separate catalog endpoint.
 */
export async function fetchExperiencesListConfig(): Promise<ExperiencesListFeedV2> {
  const remote = await fetchRemoteJson(EXPERIENCES_LIST_FEED_PATH, ExperiencesListFeedV2Schema, {
    revalidate: 3600,
    tags: ['experiences-list'],
  });

  if (!remote.data) {
    throw new Error(`[ExperiencesList] Experiences feed unavailable: ${remote.reason}`);
  }

  return remote.data;
}

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
function toHeroContent(t: Translator): ExperiencesListData['hero'] {
  return {
    title: t('ExperiencesList.hero.title'),
    subtitle: t('ExperiencesList.hero.subtitle'),
    summary: t('ExperiencesList.hero.summary'),
    highlightText: t('ExperiencesList.hero.highlightText'),
    ctaLabel: t('ExperiencesList.hero.ctaLabel'),
    helperText: t('ExperiencesList.hero.helperText'),
    hideCta: false,
    ctaTargetId: 'experiences-cards',
    badges: [
      { label: t('ExperiencesList.hero.badges.nature'), icon: 'none' },
      { label: t('ExperiencesList.hero.badges.culture'), icon: 'none' },
      { label: t('ExperiencesList.hero.badges.hosted'), icon: 'none' },
    ],
  };
}

export async function getExperiencesListSSR(locale: string): Promise<ExperiencesListData> {
  const [t, feed] = await Promise.all([
    getTranslations({ locale }),
    fetchExperiencesListConfig(),
  ]);

  const { page } = EXPERIENCES_LIST_I18N;

  const translated: ExperiencesListData = {
    metaTitle: t(page.metaTitle),
    metaDescription: t(page.metaDescription),
    sectionTitle: t(page.sectionTitle),
    sectionSubtitle: t(page.sectionSubtitle),
    fromLabel: t(page.fromLabel),
    viewDetails: t(page.viewDetails),
    hero: toHeroContent(t),
    cards: feed.experiences.filter(isPublished).map((entry) => toCard(entry, t)),
  };

  const translatedResult = ExperiencesListDataSchema.safeParse(translated);
  if (!translatedResult.success) {
    console.error('[ExperiencesList] Translated data validation failed:', translatedResult.error.format());
    throw new Error('[ExperiencesList] Invalid translated list data');
  }

  return translatedResult.data;
}
