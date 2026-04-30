import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import LandingCategoryCard from './LandingCategoryCard';
import { CATEGORIES_FIXTURE } from './__fixtures__/categoriesFixture';

const FIRST = CATEGORIES_FIXTURE.items[0];

describe('LandingCategoryCard', () => {
  afterEach(() => cleanup());

  it('renders title, description and CTA label', () => {
    render(<LandingCategoryCard category={FIRST} />);
    expect(screen.getByRole('heading', { level: 3, name: FIRST.title })).toBeInTheDocument();
    expect(screen.getByText(FIRST.description)).toBeInTheDocument();
    expect(screen.getByText(FIRST.ctaLabel)).toBeInTheDocument();
  });

  it('renders an internal link to category.href', () => {
    render(<LandingCategoryCard category={FIRST} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', FIRST.href);
  });

  it('renders the image with empty alt (decorative)', () => {
    const { container } = render(<LandingCategoryCard category={FIRST} />);
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('alt')).toBe('');
  });

  it('falls back gracefully when iconName is unknown', () => {
    render(
      <LandingCategoryCard
        category={{ ...FIRST, iconName: 'NotAnIcon' }}
      />,
    );
    expect(screen.getByText(FIRST.title)).toBeInTheDocument();
  });
});
