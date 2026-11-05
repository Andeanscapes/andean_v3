import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextIntlClientProvider } from 'next-intl';

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import LandingTravelerSegments from './LandingTravelerSegments';
import { TRAVELER_SEGMENTS_FIXTURE } from './__fixtures__/travelerSegmentsFixture';

const [FIRST, SECOND] = TRAVELER_SEGMENTS_FIXTURE.segments;

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={{}}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe('LandingTravelerSegments', () => {
  afterEach(() => cleanup());

  it('renders section heading with id', () => {
    renderWithIntl(<LandingTravelerSegments travelerSegments={TRAVELER_SEGMENTS_FIXTURE} />);
    const heading = screen.getByRole('heading', {
      level: 2,
      name: TRAVELER_SEGMENTS_FIXTURE.sectionTitle,
    });
    expect(heading.id).toBe('landing-traveler-title');
  });

  it('renders the first segment as initially active with its title, bullets and photo', () => {
    renderWithIntl(<LandingTravelerSegments travelerSegments={TRAVELER_SEGMENTS_FIXTURE} />);
    expect(screen.getByRole('button', { name: FIRST.label, pressed: true })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: FIRST.title })).toBeInTheDocument();
    for (const bullet of FIRST.bullets) expect(screen.getByText(bullet)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: FIRST.imageAlt })).toHaveAttribute('src', FIRST.image);
    expect(screen.getByRole('region', { name: FIRST.title })).toBeInTheDocument();
  });

  it('serves the -mobile photo below md', () => {
    const { container } = renderWithIntl(
      <LandingTravelerSegments travelerSegments={TRAVELER_SEGMENTS_FIXTURE} />,
    );
    expect(container.querySelector('source')?.getAttribute('srcset')).toBe(
      FIRST.image.replace(/\.webp$/, '-mobile.webp'),
    );
  });

  it('switches title, bullets and photo when another segment is selected', async () => {
    const user = userEvent.setup();
    renderWithIntl(<LandingTravelerSegments travelerSegments={TRAVELER_SEGMENTS_FIXTURE} />);

    await user.click(screen.getByRole('button', { name: SECOND.label, pressed: false }));

    expect(screen.getByRole('heading', { level: 3, name: SECOND.title })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3, name: FIRST.title })).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: SECOND.imageAlt })).toHaveAttribute('src', SECOND.image);
    expect(screen.getByRole('link')).toHaveAttribute('href', SECOND.ctaHref);
  });

  it('renders nothing when segments is empty', () => {
    const { container } = renderWithIntl(
      <LandingTravelerSegments
        travelerSegments={{ ...TRAVELER_SEGMENTS_FIXTURE, segments: [] }}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
