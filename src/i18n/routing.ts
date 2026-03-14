import {defineRouting} from 'next-intl/routing';

export const locales = ['en', 'es', 'fr'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: 'en' as Locale,
  // Keeps default locale unprefixed: "/" for en, "/es" for Spanish, "/fr" for French
  localePrefix: 'as-needed',
  // Disable automatic locale detection from browser headers
  localeDetection: false
});
