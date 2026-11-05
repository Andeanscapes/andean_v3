import { describe, expect, it } from 'vitest';
import { buildAbsoluteLocalizedUrl, buildLocalizedAlternates, buildOgLocale, toOgLocale } from './seoUrls';

describe('localized SEO URLs', () => {
  it('keeps structured-data URLs in the current locale', () => {
    expect(buildAbsoluteLocalizedUrl('es', '/experiences')).toBe(
      'https://andeanscapes.com/es/experiences',
    );
    expect(buildAbsoluteLocalizedUrl('fr', '/experiences')).toBe(
      'https://andeanscapes.com/fr/experiences',
    );
  });

  it('keeps English unprefixed and provides a stable x-default alternate', () => {
    expect(buildLocalizedAlternates('/experiences')).toEqual({
      en: 'https://andeanscapes.com/experiences',
      es: 'https://andeanscapes.com/es/experiences',
      fr: 'https://andeanscapes.com/fr/experiences',
      'x-default': 'https://andeanscapes.com/experiences',
    });
  });
});

describe('Open Graph locales', () => {
  it('maps each locale to language_TERRITORY', () => {
    expect(toOgLocale('en')).toBe('en_US');
    expect(toOgLocale('es')).toBe('es_CO');
    expect(toOgLocale('fr')).toBe('fr_FR');
    expect(toOgLocale('xx')).toBe('en_US');
  });

  it('lists the other locales as alternates', () => {
    expect(buildOgLocale('fr')).toEqual({ locale: 'fr_FR', alternateLocale: ['en_US', 'es_CO'] });
  });
});
