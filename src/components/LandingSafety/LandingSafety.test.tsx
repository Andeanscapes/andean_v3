import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import LandingSafety from './LandingSafety';
import { SAFETY_FIXTURE } from './__fixtures__/safetyFixture';

describe('LandingSafety', () => {
  afterEach(() => cleanup());

  it('renders heading and lead', () => {
    render(<LandingSafety safety={SAFETY_FIXTURE} />);
    const heading = screen.getByRole('heading', { level: 2, name: SAFETY_FIXTURE.sectionTitle });
    expect(heading.id).toBe('landing-safety-title');
    expect(screen.getByText(SAFETY_FIXTURE.lead)).toBeInTheDocument();
  });

  it('renders one list item per safety item', () => {
    render(<LandingSafety safety={SAFETY_FIXTURE} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(SAFETY_FIXTURE.items.length);
    for (const item of SAFETY_FIXTURE.items) {
      expect(screen.getByText(item.title)).toBeInTheDocument();
    }
  });

  it('renders nothing when items is empty', () => {
    const { container } = render(
      <LandingSafety safety={{ ...SAFETY_FIXTURE, items: [] }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
