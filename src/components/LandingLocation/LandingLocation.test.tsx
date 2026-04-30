import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import LandingLocation from './LandingLocation';
import { LOCATION_FIXTURE } from './__fixtures__/locationFixture';

describe('LandingLocation', () => {
  afterEach(() => cleanup());

  it('renders section heading with id', () => {
    render(<LandingLocation locationBrand={LOCATION_FIXTURE} />);
    const heading = screen.getByRole('heading', { level: 2, name: LOCATION_FIXTURE.sectionTitle });
    expect(heading.id).toBe('landing-location-title');
  });

  it('renders the map with the provided alt text and source', () => {
    render(<LandingLocation locationBrand={LOCATION_FIXTURE} />);
    const img = screen.getByAltText(LOCATION_FIXTURE.mapImageAlt);
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toBe(LOCATION_FIXTURE.mapImage);
  });

  it('renders one list item per bullet and exposes the CTA link', () => {
    render(<LandingLocation locationBrand={LOCATION_FIXTURE} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(LOCATION_FIXTURE.bullets.length);
    for (const bullet of LOCATION_FIXTURE.bullets) {
      expect(screen.getByText(bullet.label)).toBeInTheDocument();
    }
    expect(screen.getByRole('link', { name: new RegExp(LOCATION_FIXTURE.ctaLabel, 'i') }))
      .toHaveAttribute('href', LOCATION_FIXTURE.ctaHref);
  });
});
