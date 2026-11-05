import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import OptimizedBackgroundImage from './OptimizedBackgroundImage';

describe('OptimizedBackgroundImage', () => {
  it('renders image with async decoding and lazy loading by default', () => {
    const { container } = render(
      <OptimizedBackgroundImage src="/assets/images/hero/h10.webp" />
    );

    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  /** Reusing the hero photo must hit the AVIF the hero already downloaded. */
  it('serves the AVIF first when the background is a hero photo', () => {
    const src = 'https://cdn.example.com/images/experiences/x/hero.webp';
    const { container } = render(<OptimizedBackgroundImage src={src} />);
    const avif = Array.from(container.querySelectorAll('source[type="image/avif"]')).map((s) => s.getAttribute('srcset'));
    expect(avif).toEqual([
      'https://cdn.example.com/images/experiences/x/hero-mobile.avif',
      'https://cdn.example.com/images/experiences/x/hero.avif',
    ]);
  });

  /** Non-hero images have no published AVIF; a <source> that 404s does not fall back. */
  it('never requests AVIF for a non-hero image', () => {
    const { container } = render(<OptimizedBackgroundImage src="/assets/images/hero/h10.webp" />);
    expect(container.querySelector('source[type="image/avif"]')).toBeNull();
  });
});
