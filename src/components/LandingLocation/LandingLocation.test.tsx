import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type React from 'react';

// Uses the shared wrapper: this component reads translated copy, which needs the
// next-intl provider.
import { render } from '@/test/test-utils';

// Same stub as the other localized-link tests: next-intl's client navigation
// cannot resolve `next/navigation` under vitest.
vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

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
