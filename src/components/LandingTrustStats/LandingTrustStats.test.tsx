import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import LandingTrustStats from './LandingTrustStats';
import { TRUST_STATS_FIXTURE } from './__fixtures__/trustStatsFixture';

describe('LandingTrustStats', () => {
  afterEach(() => cleanup());

  it('renders one term + definition pair per stat', () => {
    render(<LandingTrustStats trustStats={TRUST_STATS_FIXTURE} />);
    for (const item of TRUST_STATS_FIXTURE.items) {
      expect(screen.getByText(item.value)).toBeInTheDocument();
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
  });

  it('uses a description list with aria-labelledby', () => {
    const { container } = render(<LandingTrustStats trustStats={TRUST_STATS_FIXTURE} />);
    const dl = container.querySelector('dl');
    expect(dl).not.toBeNull();
    expect(dl?.getAttribute('aria-labelledby')).toBe('landing-truststats-title');
  });

  it('renders nothing when items is empty', () => {
    const { container } = render(
      <LandingTrustStats trustStats={{ ...TRUST_STATS_FIXTURE, items: [] }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
