import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import LandingHeroBrand from './LandingHeroBrand';
import { HERO_BRAND_FIXTURE } from './__fixtures__/heroBrandFixture';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), prefetch: vi.fn() }),
}));

describe('LandingHeroBrand', () => {
  afterEach(() => cleanup());

  it('renders a section with aria-labelledby pointing to the hero title', () => {
    const { container } = render(<LandingHeroBrand hero={HERO_BRAND_FIXTURE} />);
    const section = container.querySelector('section');
    expect(section).not.toBeNull();
    expect(section?.getAttribute('aria-labelledby')).toBe('landing-hero-brand-title');
    expect(screen.getByRole('heading', { level: 1, name: HERO_BRAND_FIXTURE.title }).id).toBe(
      'landing-hero-brand-title',
    );
  });

  it('renders both content and search children', () => {
    render(<LandingHeroBrand hero={HERO_BRAND_FIXTURE} />);
    // content
    expect(screen.getByText(HERO_BRAND_FIXTURE.description)).toBeInTheDocument();
    // search submit
    expect(
      screen.getByRole('button', { name: HERO_BRAND_FIXTURE.search.submitLabel }),
    ).toBeInTheDocument();
  });

  it('renders the eager LCP background image', () => {
    const { container } = render(<LandingHeroBrand hero={HERO_BRAND_FIXTURE} />);
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('loading')).toBe('eager');
    expect(img?.getAttribute('src')).toBe(HERO_BRAND_FIXTURE.backgroundImage);
  });
});
