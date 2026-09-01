import { locales, type Locale } from '@/i18n/routing';
import { experiencePath } from '@/utils/experienceRoutes';

const SITE_URL = 'https://andeanscapes.com';

function resolveLocalePath(locale: string, path: string) {
  if (locale === 'en') return path;
  return `/${locale}${path}`;
}

export function buildExperiencePath(locale: string, experienceName: string, suffix = '') {
  const basePath = experiencePath(experienceName, suffix);
  return resolveLocalePath(locale, basePath);
}

export function buildExperienceAlternates(experienceName: string, suffix = '') {
  const languages: Record<string, string> = {};

  for (const locale of locales) {
    const path = buildExperiencePath(locale, experienceName, suffix);
    languages[locale] = `${SITE_URL}${path}`;
  }

  languages['x-default'] = `${SITE_URL}${buildExperiencePath('en', experienceName, suffix)}`;

  return languages;
}

export function toAbsoluteUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function sanitizeLocale(locale: string): Locale {
  return locales.includes(locale as Locale) ? (locale as Locale) : 'en';
}

export const SEO_SITE_URL = SITE_URL;
