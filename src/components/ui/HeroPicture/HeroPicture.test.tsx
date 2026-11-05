import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HeroPicture } from './HeroPicture';

describe('HeroPicture', () => {
  /** Browsers take the first <source> whose media AND type match. */
  it('lists AVIF before WebP for each breakpoint, with the WebP <img> as fallback', () => {
    const { container } = render(<HeroPicture src="https://cdn.example.com/images/brand/landing-hero.webp" />);
    const sources = Array.from(container.querySelectorAll('source')).map((s) => [
      s.getAttribute('type'),
      s.getAttribute('media'),
      s.getAttribute('srcset'),
    ]);

    expect(sources).toEqual([
      ['image/avif', '(max-width: 767px)', 'https://cdn.example.com/images/brand/landing-hero-mobile.avif'],
      [null, '(max-width: 767px)', 'https://cdn.example.com/images/brand/landing-hero-mobile.webp'],
      ['image/avif', null, 'https://cdn.example.com/images/brand/landing-hero.avif'],
    ]);
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/images/brand/landing-hero.webp');
    expect(img).toHaveAttribute('fetchpriority', 'high');
    expect(img).toHaveAttribute('loading', 'eager');
  });

  it('omits AVIF sources for a non-webp hero', () => {
    const { container } = render(<HeroPicture src="/images/brand/hero.jpg" />);
    expect(container.querySelector('source[type="image/avif"]')).toBeNull();
  });
});
