import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import LandingTravelerSegments from './LandingTravelerSegments';
import { TRAVELER_SEGMENTS_FIXTURE } from './__fixtures__/travelerSegmentsFixture';

const [FIRST, SECOND] = TRAVELER_SEGMENTS_FIXTURE.segments;

describe('LandingTravelerSegments', () => {
  afterEach(() => cleanup());

  it('renders section heading with id', () => {
    render(<LandingTravelerSegments travelerSegments={TRAVELER_SEGMENTS_FIXTURE} />);
    const heading = screen.getByRole('heading', {
      level: 2,
      name: TRAVELER_SEGMENTS_FIXTURE.sectionTitle,
    });
    expect(heading.id).toBe('landing-traveler-title');
  });

  it('renders the first segment as initially active', () => {
    render(<LandingTravelerSegments travelerSegments={TRAVELER_SEGMENTS_FIXTURE} />);
    expect(screen.getByText(FIRST.recommendation)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: FIRST.label, pressed: true }),
    ).toBeInTheDocument();
  });

  it('switches recommendation when another segment is selected', async () => {
    const user = userEvent.setup();
    render(<LandingTravelerSegments travelerSegments={TRAVELER_SEGMENTS_FIXTURE} />);

    await user.click(screen.getByRole('button', { name: SECOND.label, pressed: false }));

    expect(screen.getByText(SECOND.recommendation)).toBeInTheDocument();
    expect(screen.queryByText(FIRST.recommendation)).not.toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', SECOND.ctaHref);
  });

  it('renders nothing when segments is empty', () => {
    const { container } = render(
      <LandingTravelerSegments
        travelerSegments={{ ...TRAVELER_SEGMENTS_FIXTURE, segments: [] }}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
