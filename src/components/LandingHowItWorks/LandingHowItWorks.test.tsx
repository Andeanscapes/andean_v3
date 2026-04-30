import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import LandingHowItWorks from './LandingHowItWorks';
import { HOWITWORKS_FIXTURE } from './__fixtures__/howItWorksFixture';

describe('LandingHowItWorks', () => {
  afterEach(() => cleanup());

  it('renders section heading with id', () => {
    render(<LandingHowItWorks howItWorks={HOWITWORKS_FIXTURE} />);
    const heading = screen.getByRole('heading', {
      level: 2,
      name: HOWITWORKS_FIXTURE.sectionTitle,
    });
    expect(heading.id).toBe('landing-howitworks-title');
  });

  it('renders one ordered list item per step in order', () => {
    render(<LandingHowItWorks howItWorks={HOWITWORKS_FIXTURE} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(HOWITWORKS_FIXTURE.steps.length);

    HOWITWORKS_FIXTURE.steps.forEach((step, idx) => {
      expect(items[idx]).toHaveTextContent(step.title);
      expect(items[idx]).toHaveTextContent(step.description);
      expect(items[idx]).toHaveTextContent(String(idx + 1));
    });
  });

  it('renders nothing when steps is empty', () => {
    const { container } = render(
      <LandingHowItWorks howItWorks={{ ...HOWITWORKS_FIXTURE, steps: [] }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
