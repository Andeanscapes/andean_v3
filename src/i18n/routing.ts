export const locales = ['en', 'es'] as const;
export type Locale = (typeof locales)[number];

export const routing = {
  locales,
  defaultLocale: 'en' as Locale,
  // Keeps default locale unprefixed: "/" for en, "/es" for Spanish
  localePrefix: 'as-needed' as const
};
