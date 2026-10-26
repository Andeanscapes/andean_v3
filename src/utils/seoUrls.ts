/**
 * Canonical/alternate URL construction for metadata, JSON-LD, sitemap and llms.txt.
 *
 * The single place the locale prefix rule (English unprefixed) is applied to
 * absolute URLs. Paths passed in are locale-free (`/`, `/experiences`, ...).
 */
import { locales, type Locale } from '@/i18n/routing';
import { SITE_INFO } from '@/constant/SiteConfig';
import { experiencePath } from '@/utils/experienceRoutes';

const SITE_URL = SITE_INFO.url;

function resolveLocalePath(locale: string, path: string) {
  if (locale === 'en') return path;
  // Locale home is `/es`, not `/es/`, so canonical and sitemap agree.
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

export function buildExperiencePath(locale: string, experienceName: string, suffix = '') {
  return resolveLocalePath(locale, experiencePath(experienceName, suffix));
}

/** Absolute URL for a locale-free path such as `/` or `/experiences`. */
export function buildAbsoluteLocalizedUrl(locale: string, path: string) {
  if (path === '/' && locale === 'en') return SITE_URL;
  return `${SITE_URL}${resolveLocalePath(locale, path)}`;
}

/** hreflang map (every locale + `x-default` → English) for a locale-free path. */
export function buildLocalizedAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = buildAbsoluteLocalizedUrl(locale, path);
  }
  languages['x-default'] = buildAbsoluteLocalizedUrl('en', path);
  return languages;
}

export function buildExperienceAlternates(experienceName: string, suffix = '') {
  return buildLocalizedAlternates(experiencePath(experienceName, suffix));
}

export function toAbsoluteUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function sanitizeLocale(locale: string): Locale {
  return locales.includes(locale as Locale) ? (locale as Locale) : 'en';
}

export const SEO_SITE_URL = SITE_URL;
