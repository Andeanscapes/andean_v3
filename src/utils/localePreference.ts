import { locales, routing, type Locale } from '@/i18n/routing';

/**
 * Browser-side language preference. The server never reads it: page HTML stays
 * a function of the URL (edge cache), and crawlers never carry a preference, so
 * they are never redirected.
 */
const PREFERENCE_KEY = 'andean.locale';
const DISMISSED_KEY = 'andean.localeSuggestionDismissed';

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private mode or storage disabled: the suggestion simply shows again next visit.
  }
}

function isLocale(value: string | null): value is Locale {
  return value !== null && (locales as readonly string[]).includes(value);
}

/** First supported locale in the browser's language list (`es-CO` → `es`). */
export function matchBrowserLocale(browserLanguages: readonly string[]): Locale | null {
  for (const language of browserLanguages) {
    const base = language.toLowerCase().split('-')[0];
    if (isLocale(base)) return base;
  }
  return null;
}

export function getSavedLocale(): Locale | null {
  const saved = readStorage(PREFERENCE_KEY);
  return isLocale(saved) ? saved : null;
}

export function saveLocale(locale: Locale): void {
  writeStorage(PREFERENCE_KEY, locale);
}

export function isSuggestionDismissed(): boolean {
  return readStorage(DISMISSED_KEY) === '1';
}

export function dismissSuggestion(): void {
  writeStorage(DISMISSED_KEY, '1');
}

/**
 * Locale to send a returning visitor to, or null. Only the unprefixed home (`/`)
 * redirects, and only with a saved preference: explicit /es and /fr links, inner
 * pages and crawlers (no preference) always stay where they are.
 */
export function getHomeRedirectLocale(saved: Locale | null, currentLocale: Locale, pathname: string): Locale | null {
  if (!saved || saved === currentLocale) return null;
  return pathname === '/' && currentLocale === routing.defaultLocale ? saved : null;
}
