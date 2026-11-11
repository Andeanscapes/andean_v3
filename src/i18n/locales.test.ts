import { describe, expect, it } from 'vitest';
import { locales, LOCALE_CONFIG, isLocale } from './locales';

describe('locale table', () => {
  it('has a complete config for every locale, with unique hreflang and OG values', () => {
    for (const locale of locales) {
      const config = LOCALE_CONFIG[locale];
      expect(config.label).not.toBe('');
      expect(config.hreflang).not.toBe('');
      expect(config.ogLocale).toMatch(/^[a-z]{2}_[A-Z]{2}$/);
      expect(config.icuLocale).toMatch(/^[a-z]{2}-[A-Z]{2}$/);
      expect(['ltr', 'rtl']).toContain(config.dir);
    }
    const hreflangs = locales.map((locale) => LOCALE_CONFIG[locale].hreflang);
    expect(new Set(hreflangs).size).toBe(hreflangs.length);
  });

  it('recognises only configured locales', () => {
    expect(isLocale('fr')).toBe(true);
    expect(isLocale('de')).toBe(true);
    expect(isLocale('pt')).toBe(false);
  });
});
