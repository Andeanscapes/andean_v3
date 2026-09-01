/**
 * Landing page domain code → source-controlled i18n key mappings.
 *
 * Maps review sources and country codes to their localized keys.
 * Copy, icons, routes, and section structure are frontend-owned.
 */

import type { ReviewSourceCode } from '@/lib/schemas/feed/v2';

export const LANDING_I18N = {
  reviewSource: {
    airbnb: 'Landing.reviews.verifiedStay',
  } as const satisfies Record<ReviewSourceCode, string>,
  /**
   * Only country codes that appear in the feed AND have copy in en/es/fr.
   * Adding a code here without adding the locale copy fails the contract test.
   * A review whose countryCode is unmapped renders without a country line.
   */
  countries: {
    CO: 'Landing.reviews.countries.colombia',
    ES: 'Landing.reviews.countries.spain',
  } as const,
} as const;

export type MappedCountryCode = keyof typeof LANDING_I18N.countries;

export function countryKeyFor(countryCode: string | undefined): string | undefined {
  if (!countryCode) return undefined;
  return LANDING_I18N.countries[countryCode as MappedCountryCode];
}

export type LandingI18n = typeof LANDING_I18N;
