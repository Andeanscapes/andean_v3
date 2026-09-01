import { describe, it, expect } from 'vitest';
import { formatMoney, toIcuLocale } from './formatCurrency';

describe('toIcuLocale', () => {
  it('maps each supported app locale to its ICU locale', () => {
    expect(toIcuLocale('en')).toBe('en-US');
    expect(toIcuLocale('es')).toBe('es-CO');
    expect(toIcuLocale('fr')).toBe('fr-FR');
  });

  it('falls back to es-CO for an unknown locale', () => {
    expect(toIcuLocale('de')).toBe('es-CO');
    expect(toIcuLocale('')).toBe('es-CO');
  });
});

describe('formatMoney', () => {
  // Separators are ICU/runtime dependent, so assert on digits + absence of decimals.
  it.each(['en', 'es', 'fr', 'de'])('formats 55000 without decimals in %s', (locale) => {
    const result = formatMoney(55000, locale, 'COP');

    expect(result).toMatch(/55[\s.,\u00a0\u202f]?000/);
    expect(result).not.toMatch(/[.,]\d{2}\b/);
  });

  it('formats zero', () => {
    expect(formatMoney(0, 'es', 'COP')).toMatch(/0/);
  });

  it('is stable for the same amount and locale', () => {
    expect(formatMoney(120000, 'es', 'COP')).toBe(formatMoney(120000, 'es', 'COP'));
  });

  it('drops fractional input rather than showing cents', () => {
    expect(formatMoney(55000.49, 'es', 'COP')).not.toMatch(/[.,]\d{2}\b/);
  });
});

describe('currency validation on the UI shapes', () => {
  it('rejects a missing or malformed currency instead of defaulting to COP', async () => {
    const { ExperienceListCardSchema } = await import('@/lib/schemas/experiencesList.schema');

    const card = {
      id: 'emerald-mining-adventure',
      title: 'T',
      description: 'D',
      image: '/assets/images/hero/h10.webp',
      price: 500000,
      metadata: [],
      href: '/experiences/emerald-mining-adventure',
    };

    // Previously `z.string().default('COP')`: an absent currency silently became
    // COP, and a malformed one reached Intl.NumberFormat and threw at render.
    expect(ExperienceListCardSchema.safeParse(card).success).toBe(false);
    expect(ExperienceListCardSchema.safeParse({ ...card, currency: 'cop' }).success).toBe(false);
    expect(ExperienceListCardSchema.safeParse({ ...card, currency: '' }).success).toBe(false);
    expect(ExperienceListCardSchema.safeParse({ ...card, currency: 'COP' }).success).toBe(true);
  });
});
