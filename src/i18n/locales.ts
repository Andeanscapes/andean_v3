/**
 * Single source of truth for the supported languages. Routing, SEO locales,
 * number and currency formats, text direction and the language selector all
 * read from this table, so adding a language starts here.
 *
 * Kept free of `next-intl` imports so that content modules can use the
 * `Locale` type without pulling in the routing runtime.
 */
export const locales = ['en', 'es', 'fr', 'de', 'it'] as const;
export type Locale = (typeof locales)[number];

export type TextDirection = 'ltr' | 'rtl';

export interface LocaleConfig {
  /** Name in the language selector, written in that language. */
  label: string;
  /** Value for `hreflang` annotations. Can differ from the URL code (e.g. `zh-Hant-HK`). */
  hreflang: string;
  /** Open Graph `language_TERRITORY`. */
  ogLocale: string;
  /** ICU locale for `Intl` number, currency and date formatting. */
  icuLocale: string;
  dir: TextDirection;
  /**
   * Whether search engines may index this language. A new language ships with
   * `false` (noindex, kept out of hreflang and the sitemap) until a native
   * reviewer approves its copy; flip it to `true` to publish.
   */
  indexable: boolean;
}

export const LOCALE_CONFIG: Record<Locale, LocaleConfig> = {
  en: { label: 'English', hreflang: 'en', ogLocale: 'en_US', icuLocale: 'en-US', dir: 'ltr', indexable: true },
  es: { label: 'Español', hreflang: 'es', ogLocale: 'es_CO', icuLocale: 'es-CO', dir: 'ltr', indexable: true },
  fr: { label: 'Français', hreflang: 'fr', ogLocale: 'fr_FR', icuLocale: 'fr-FR', dir: 'ltr', indexable: true },
  // Machine-drafted; noindex until a native reviewer approves the copy.
  de: { label: 'Deutsch', hreflang: 'de', ogLocale: 'de_DE', icuLocale: 'de-DE', dir: 'ltr', indexable: false },
  it: { label: 'Italiano', hreflang: 'it', ogLocale: 'it_IT', icuLocale: 'it-IT', dir: 'ltr', indexable: false },
};

/** Locales search engines may index: the only ones in hreflang, Open Graph alternates and the sitemap. */
export const indexableLocales: readonly Locale[] = locales.filter((locale) => LOCALE_CONFIG[locale].indexable);

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
