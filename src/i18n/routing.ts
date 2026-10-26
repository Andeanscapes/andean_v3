import {defineRouting} from 'next-intl/routing';

export const locales = ['en', 'es', 'fr'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: 'en' as Locale,
  // Keeps default locale unprefixed: "/" for en, "/es" for Spanish, "/fr" for French
  localePrefix: 'as-needed',
  // Disable automatic locale detection from browser headers
  localeDetection: false,
  // With detection off nothing reads the locale cookie, and a `Set-Cookie` on
  // every page makes the HTML uncacheable at the edge (see `src/lib/edge-cache.ts`).
  localeCookie: false
});
