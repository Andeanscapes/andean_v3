/**
 * Experiences list page domain code → source-controlled i18n key mappings.
 *
 * Maps card badge codes and highlight codes to their localized keys.
 * These are frontend concerns; the feed carries only the codes.
 */

import type { BadgeCode, HighlightCode } from '@/lib/schemas/feed/v2';

export const EXPERIENCES_LIST_I18N = {
  badges: {
    featured: 'ExperiencesList.featuredTag',
    'coming-soon': 'ExperiencesList.comingSoonTag',
  } as const satisfies Record<BadgeCode, string>,
  highlights: {
    transportIncluded: 'ExperiencesList.transportIncluded',
    smallGroups: 'ExperiencesList.smallGroups',
    localGuides: 'ExperiencesList.localGuides',
  } as const satisfies Record<HighlightCode, string>,
  /**
   * Parameterized card metadata. The v1 feed shipped the literals
   * `cardMeta.duration2d1n` / `cardMeta.startsInChivor`; v2 sends structured
   * `duration` and `location`, so these take ICU arguments instead.
   */
  cardMeta: {
    duration: 'ExperiencesList.cardMeta.durationDaysNights',
    startsIn: 'ExperiencesList.cardMeta.startsIn',
  },
  page: {
    metaTitle: 'ExperiencesList.metaTitle',
    metaDescription: 'ExperiencesList.metaDescription',
    sectionTitle: 'ExperiencesList.sectionTitle',
    sectionSubtitle: 'ExperiencesList.sectionSubtitle',
    fromLabel: 'ExperiencesList.fromLabel',
    viewDetails: 'ExperiencesList.viewDetails',
    priceQualifier: 'ExperiencesList.priceQualifierPerPerson',
  },
} as const;

export type ExperiencesListI18n = typeof EXPERIENCES_LIST_I18N;
