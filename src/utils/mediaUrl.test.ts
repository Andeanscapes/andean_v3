import { describe, it, expect, afterEach } from 'vitest';
import { resolveMediaUrl, resolveMediaUrlsDeep } from './mediaUrl';

afterEach(() => {
  delete process.env.NEXT_PUBLIC_CDN_BASE_URL;
});

describe('resolveMediaUrl', () => {
  it('resolves /images/ paths to the default CDN', () => {
    expect(resolveMediaUrl('/images/card.webp')).toBe('https://cdn.andeanscapes.com/images/card.webp');
  });

  it('resolves /videos/ paths to the default CDN', () => {
    expect(resolveMediaUrl('/videos/hero.webm')).toBe('https://cdn.andeanscapes.com/videos/hero.webm');
  });

  it('uses NEXT_PUBLIC_CDN_BASE_URL when set', () => {
    process.env.NEXT_PUBLIC_CDN_BASE_URL = 'https://cdn.example.com';
    expect(resolveMediaUrl('/images/card.webp')).toBe('https://cdn.example.com/images/card.webp');
  });

  it('strips a trailing slash from the configured base', () => {
    process.env.NEXT_PUBLIC_CDN_BASE_URL = 'https://cdn.example.com/';
    expect(resolveMediaUrl('/images/card.webp')).toBe('https://cdn.example.com/images/card.webp');
  });

  it('leaves local assets untouched', () => {
    expect(resolveMediaUrl('/landing/map-bogota-chivor.svg')).toBe('/landing/map-bogota-chivor.svg');
  });

  // `/assets/...` is the prefix the landing structure fallbacks use while the
  // feed `media` block is rolling out; rewriting it would 404 on the CDN.
  it('leaves source-controlled /assets paths untouched', () => {
    expect(resolveMediaUrl('/assets/images/hero/h0.webp')).toBe('/assets/images/hero/h0.webp');
    expect(resolveMediaUrl('/assets/images/details/emerald-mining-card.webp')).toBe(
      '/assets/images/details/emerald-mining-card.webp',
    );
  });

  it('leaves internal hrefs untouched', () => {
    expect(resolveMediaUrl('/experiences')).toBe('/experiences');
    expect(resolveMediaUrl('#landing-reviews')).toBe('#landing-reviews');
  });

  it('leaves absolute URLs untouched', () => {
    expect(resolveMediaUrl('https://evil.example.com/x.webp')).toBe('https://evil.example.com/x.webp');
  });
});

describe('resolveMediaUrlsDeep', () => {
  it('resolves nested media strings in an object tree', () => {
    const input = {
      hero: { backgroundImageUrl: '/images/hero/h10.webp' },
      cards: [{ image: '/images/card.webp' }],
      href: '/experiences',
    };
    expect(resolveMediaUrlsDeep(input)).toEqual({
      hero: { backgroundImageUrl: 'https://cdn.andeanscapes.com/images/hero/h10.webp' },
      cards: [{ image: 'https://cdn.andeanscapes.com/images/card.webp' }],
      href: '/experiences',
    });
  });

  it('preserves non-string values', () => {
    const input = { count: 5, available: true, nothing: null, price: { amount: 100 } };
    expect(resolveMediaUrlsDeep(input)).toEqual(input);
  });

  it('resolves strings inside arrays', () => {
    const input = { gallery: ['/images/one.webp', '/videos/one.webm'] };
    expect(resolveMediaUrlsDeep(input)).toEqual({
      gallery: [
        'https://cdn.andeanscapes.com/images/one.webp',
        'https://cdn.andeanscapes.com/videos/one.webm',
      ],
    });
  });
});
