import { describe, expect, it } from 'vitest';
import { buildAbsoluteLocalizedUrl, buildLocalizedAlternates } from './seoUrls';

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
