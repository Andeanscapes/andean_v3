import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';

import LandingFeaturedExperiences from './LandingFeaturedExperiences';
import { FEATURED_FIXTURE } from './__fixtures__/featuredFixture';

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={{}}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe('LandingFeaturedExperiences', () => {
  afterEach(() => cleanup());

  it('renders the section heading with id for aria-labelledby', () => {
    renderWithIntl(<LandingFeaturedExperiences featured={FEATURED_FIXTURE} />);
    const heading = screen.getByRole('heading', {
      level: 2,
      name: FEATURED_FIXTURE.sectionTitle,
    });
    expect(heading.id).toBe('landing-featured-title');
  });

  it('renders one list item per featured item', () => {
    renderWithIntl(<LandingFeaturedExperiences featured={FEATURED_FIXTURE} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(FEATURED_FIXTURE.items.length);
  });

  it('renders a "view all" link to viewAllHref', () => {
    renderWithIntl(<LandingFeaturedExperiences featured={FEATURED_FIXTURE} />);
    const link = screen.getByRole('link', { name: new RegExp(FEATURED_FIXTURE.viewAllLabel, 'i') });
    expect(link).toHaveAttribute('href', FEATURED_FIXTURE.viewAllHref);
  });

  it('renders nothing when items is empty', () => {
    const { container } = renderWithIntl(
      <LandingFeaturedExperiences featured={{ ...FEATURED_FIXTURE, items: [] }} />,
    );
    expect(container.firstChild).toBeNull();
  });
});
