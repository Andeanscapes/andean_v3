import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';

import LandingFeaturedExperienceCard from './LandingFeaturedExperienceCard';
import { FEATURED_FIXTURE } from './__fixtures__/featuredFixture';

const FIRST = FEATURED_FIXTURE.items[0];

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={{}}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe('LandingFeaturedExperienceCard', () => {
  afterEach(() => cleanup());

  it('renders title, description, duration and location', () => {
    renderWithIntl(<LandingFeaturedExperienceCard experience={FIRST} />);
    expect(screen.getByRole('heading', { level: 3, name: FIRST.title })).toBeInTheDocument();
    expect(screen.getByText(FIRST.description)).toBeInTheDocument();
    expect(screen.getByText(FIRST.duration)).toBeInTheDocument();
    expect(screen.getByText(FIRST.location)).toBeInTheDocument();
  });

  it('renders the badge when provided', () => {
    renderWithIntl(<LandingFeaturedExperienceCard experience={FIRST} />);
    expect(screen.getByText(FIRST.badge as string)).toBeInTheDocument();
  });

  it('does not render the badge when omitted', () => {
    const noBadge = { ...FIRST, badge: undefined };
    renderWithIntl(<LandingFeaturedExperienceCard experience={noBadge} />);
    expect(screen.queryByText('Featured')).not.toBeInTheDocument();
  });

  it('formats price as currency and shows fromLabel + viewDetailsLabel', () => {
    renderWithIntl(<LandingFeaturedExperienceCard experience={FIRST} />);
    expect(screen.getByText(FIRST.fromLabel)).toBeInTheDocument();
    expect(screen.getByText(FIRST.viewDetailsLabel)).toBeInTheDocument();
    // 470000 COP → ICU format, e.g. "$ 470.000" or "COP 470.000"
    const priceMatch = screen.getByText(
      (content) => content.includes('470') && /COP|\$/.test(content),
    );
    expect(priceMatch).toBeInTheDocument();
  });

  it('links to experience.href', () => {
    renderWithIntl(<LandingFeaturedExperienceCard experience={FIRST} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', FIRST.href);
  });
});
