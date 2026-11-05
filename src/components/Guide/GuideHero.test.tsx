import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GuideHero } from './GuideHero';

describe('GuideHero', () => {
  it('renders one h1 and the hero through HeroPicture (AVIF + mobile variants)', () => {
    const { container } = render(
      <GuideHero
        title="History of the Chivor emerald mine"
        lead="Lead"
        imageUrl="https://cdn.example.com/images/experiences/chivor-emerald-core/hero.webp"
      />,
    );

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    const srcsets = Array.from(container.querySelectorAll('picture source')).map((s) => s.getAttribute('srcset'));
    expect(srcsets).toEqual([
      'https://cdn.example.com/images/experiences/chivor-emerald-core/hero-mobile.avif',
      'https://cdn.example.com/images/experiences/chivor-emerald-core/hero-mobile.webp',
      'https://cdn.example.com/images/experiences/chivor-emerald-core/hero.avif',
    ]);
    expect(container.querySelector('picture img')).toHaveAttribute('width', '1600');
  });
});
