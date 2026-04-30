import { describe, it, expect } from 'vitest';
import { getResponsiveImageSrc, hasImageExtension } from './responsiveImage';

describe('getResponsiveImageSrc', () => {
  it('derives mobile from .webp extension', () => {
    const result = getResponsiveImageSrc('/assets/images/hero/h10.webp');
    expect(result.desktop).toBe('/assets/images/hero/h10.webp');
    expect(result.mobile).toBe('/assets/images/hero/h10-mobile.webp');
  });

  it('derives mobile from .jpg extension', () => {
    const result = getResponsiveImageSrc('/photos/image.jpg');
    expect(result.mobile).toBe('/photos/image-mobile.jpg');
  });

  it('derives mobile from .png extension', () => {
    const result = getResponsiveImageSrc('/icons/logo.png');
    expect(result.mobile).toBe('/icons/logo-mobile.png');
  });

  it('derives mobile from .avif extension', () => {
    const result = getResponsiveImageSrc('/photos/image.avif');
    expect(result.mobile).toBe('/photos/image-mobile.avif');
  });

  it('handles absolute URLs', () => {
    const result = getResponsiveImageSrc('https://cdn.andeanscapes.com/images/card.webp');
    expect(result.desktop).toBe('https://cdn.andeanscapes.com/images/card.webp');
    expect(result.mobile).toBe('https://cdn.andeanscapes.com/images/card-mobile.webp');
  });

  it('preserves query strings', () => {
    const result = getResponsiveImageSrc('/image.webp?w=800&q=75');
    expect(result.desktop).toBe('/image.webp?w=800&q=75');
    expect(result.mobile).toBe('/image-mobile.webp?w=800&q=75');
  });

  it('returns same for both when no extension', () => {
    const result = getResponsiveImageSrc('/path/to/file');
    expect(result.desktop).toBe('/path/to/file');
    expect(result.mobile).toBe('/path/to/file');
  });

  it('handles dots in directory names', () => {
    const result = getResponsiveImageSrc('/path.v2/with.dots/image.webp');
    expect(result.mobile).toBe('/path.v2/with.dots/image-mobile.webp');
  });

  it('works with relative paths', () => {
    const result = getResponsiveImageSrc('./images/photo.jpg');
    expect(result.mobile).toBe('./images/photo-mobile.jpg');
  });
});

describe('hasImageExtension', () => {
  it('returns true for webp', () => {
    expect(hasImageExtension('/path/image.webp')).toBe(true);
  });

  it('returns true for jpg', () => {
    expect(hasImageExtension('photo.jpg')).toBe(true);
  });

  it('returns true for png', () => {
    expect(hasImageExtension('icon.png')).toBe(true);
  });

  it('returns true with query string', () => {
    expect(hasImageExtension('/img.webp?w=800')).toBe(true);
  });

  it('returns false for no extension', () => {
    expect(hasImageExtension('/path/file')).toBe(false);
  });

  it('returns false for pdf', () => {
    expect(hasImageExtension('/doc.pdf')).toBe(false);
  });
});
