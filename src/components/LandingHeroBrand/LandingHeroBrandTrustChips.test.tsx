import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import LandingHeroBrandTrustChips from './LandingHeroBrandTrustChips';
import { HERO_BRAND_FIXTURE } from './__fixtures__/heroBrandFixture';

describe('LandingHeroBrandTrustChips', () => {
  afterEach(() => cleanup());

  it('renders one chip per item with its label', () => {
    render(<LandingHeroBrandTrustChips trustChips={HERO_BRAND_FIXTURE.trustChips} />);

    HERO_BRAND_FIXTURE.trustChips.forEach((chip) => {
      expect(screen.getByText(chip.label)).toBeInTheDocument();
    });
  });

  it('exposes a list role with one listitem per chip', () => {
    render(<LandingHeroBrandTrustChips trustChips={HERO_BRAND_FIXTURE.trustChips} />);
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(HERO_BRAND_FIXTURE.trustChips.length);
  });

  it('renders nothing when trustChips is empty', () => {
    const { container } = render(<LandingHeroBrandTrustChips trustChips={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('does not crash when iconName is unknown (graceful fallback)', () => {
    render(
      <LandingHeroBrandTrustChips
        trustChips={[{ id: 'x', iconName: 'NotAnIcon', label: 'Fallback chip' }]}
      />,
    );
    expect(screen.getByText('Fallback chip')).toBeInTheDocument();
  });

  it('merges custom className on the list', () => {
    render(
      <LandingHeroBrandTrustChips trustChips={HERO_BRAND_FIXTURE.trustChips} className="custom-x" />,
    );
    expect(screen.getByRole('list').className).toContain('custom-x');
  });
});
