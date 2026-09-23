import { describe, expect, it } from 'vitest';
import { pickHeroVariant } from './heroVariant';

describe('pickHeroVariant', () => {
  const variants = ['hero-01.webp', 'hero-02.webp', 'hero-03.webp'];

  it('returns the fallback when no variants are configured', () => {
    expect(pickHeroVariant([], 'fallback.webp', () => 0.5)).toBe('fallback.webp');
  });

  it('selects a deterministic variant from the random value', () => {
    expect(pickHeroVariant(variants, 'fallback.webp', () => 0)).toBe('hero-01.webp');
    expect(pickHeroVariant(variants, 'fallback.webp', () => 0.5)).toBe('hero-02.webp');
    expect(pickHeroVariant(variants, 'fallback.webp', () => 0.99)).toBe('hero-03.webp');
  });

  it('keeps a single configured variant stable', () => {
    expect(pickHeroVariant(['hero-01.webp'], 'fallback.webp', () => 0.99)).toBe('hero-01.webp');
  });
});
