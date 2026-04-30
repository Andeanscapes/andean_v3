import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import LandingHeroBrandContent from './LandingHeroBrandContent';
import { HERO_BRAND_FIXTURE } from './__fixtures__/heroBrandFixture';

describe('LandingHeroBrandContent', () => {
  afterEach(() => cleanup());

  it('renders the hero h1 with the title id for aria-labelledby', () => {
    render(<LandingHeroBrandContent hero={HERO_BRAND_FIXTURE} />);

    const heading = screen.getByRole('heading', { level: 1, name: HERO_BRAND_FIXTURE.title });
    expect(heading).toBeInTheDocument();
    expect(heading.id).toBe('landing-hero-brand-title');
  });

  it('renders eyebrow, subtitle and description', () => {
    render(<LandingHeroBrandContent hero={HERO_BRAND_FIXTURE} />);
    expect(screen.getByText(HERO_BRAND_FIXTURE.eyebrow)).toBeInTheDocument();
    expect(screen.getByText(HERO_BRAND_FIXTURE.subtitle)).toBeInTheDocument();
    expect(screen.getByText(HERO_BRAND_FIXTURE.description)).toBeInTheDocument();
  });

  it('renders primary CTA as internal link to primaryCtaHref', () => {
    render(<LandingHeroBrandContent hero={HERO_BRAND_FIXTURE} />);
    const link = screen.getByRole('link', { name: new RegExp(HERO_BRAND_FIXTURE.primaryCtaLabel, 'i') });
    expect(link).toHaveAttribute('href', HERO_BRAND_FIXTURE.primaryCtaHref);
  });

  it('renders secondary CTA as external link with safe target/rel', () => {
    render(<LandingHeroBrandContent hero={HERO_BRAND_FIXTURE} />);
    const link = screen.getByRole('link', {
      name: new RegExp(HERO_BRAND_FIXTURE.secondaryCtaLabel, 'i'),
    });
    expect(link).toHaveAttribute('href', HERO_BRAND_FIXTURE.secondaryCtaHref);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });

  it('renders all trust chips through the TrustChips child', () => {
    render(<LandingHeroBrandContent hero={HERO_BRAND_FIXTURE} />);
    HERO_BRAND_FIXTURE.trustChips.forEach((chip) => {
      expect(screen.getByText(chip.label)).toBeInTheDocument();
    });
  });
});
