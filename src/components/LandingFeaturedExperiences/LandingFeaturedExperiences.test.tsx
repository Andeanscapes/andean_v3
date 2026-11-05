import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import LandingFeaturedExperiences from './LandingFeaturedExperiences';
import { FEATURED_FIXTURE } from './__fixtures__/featuredFixture';
import enMessages from '@/i18n/messages/en.json';

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
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
    // The section's own list; each card nests a highlight list of its own.
    const [section] = screen.getAllByRole('list');
    expect(section.querySelectorAll(':scope > li')).toHaveLength(FEATURED_FIXTURE.items.length);
  });

  it('renders a "view all" link to viewAllHref', () => {
    renderWithIntl(<LandingFeaturedExperiences featured={FEATURED_FIXTURE} />);
    const link = screen.getByRole('link', { name: new RegExp(FEATURED_FIXTURE.viewAllLabel, 'i') });
    expect(link).toHaveAttribute('href', FEATURED_FIXTURE.viewAllHref);
  });

  it('leads with the hero tour on mobile only, and keeps it out of the desktop grid', () => {
    const hero = FEATURED_FIXTURE.items[FEATURED_FIXTURE.items.length - 1];
    renderWithIntl(<LandingFeaturedExperiences featured={FEATURED_FIXTURE} heroSlug={hero.experienceSlug} />);
    const [section] = screen.getAllByRole('list');
    const items = Array.from(section.querySelectorAll(':scope > li'));

    expect(items).toHaveLength(FEATURED_FIXTURE.items.length);
    expect(items[0]).toHaveTextContent(hero.title);
    expect(items[0]).toHaveClass('md:hidden');
    for (const item of items.slice(1)) expect(item).not.toHaveClass('md:hidden');
  });

  it('hides the whole section from md when the hero tour is the only item', () => {
    const [hero] = FEATURED_FIXTURE.items;
    const { container } = renderWithIntl(
      <LandingFeaturedExperiences
        featured={{ ...FEATURED_FIXTURE, items: [hero] }}
        heroSlug={hero.experienceSlug}
      />,
    );
    expect(container.querySelector('section')).toHaveClass('md:hidden');
  });

  it('renders nothing when items is empty', () => {
    const { container } = renderWithIntl(
      <LandingFeaturedExperiences featured={{ ...FEATURED_FIXTURE, items: [] }} />,
    );
    expect(container.firstChild).toBeNull();
  });
});
