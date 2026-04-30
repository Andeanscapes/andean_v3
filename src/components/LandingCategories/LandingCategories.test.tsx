import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import LandingCategories from './LandingCategories';
import { CATEGORIES_FIXTURE } from './__fixtures__/categoriesFixture';

describe('LandingCategories', () => {
  afterEach(() => cleanup());

  it('renders the section title with the proper id for aria-labelledby', () => {
    render(<LandingCategories categories={CATEGORIES_FIXTURE} />);
    const heading = screen.getByRole('heading', {
      level: 2,
      name: CATEGORIES_FIXTURE.sectionTitle,
    });
    expect(heading.id).toBe('landing-categories-title');
  });

  it('renders one list item per category', () => {
    render(<LandingCategories categories={CATEGORIES_FIXTURE} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(CATEGORIES_FIXTURE.items.length);
  });

  it('exposes a list with aria-labelledby pointing to the heading', () => {
    render(<LandingCategories categories={CATEGORIES_FIXTURE} />);
    const list = screen.getByRole('list');
    expect(list.getAttribute('aria-labelledby')).toBe('landing-categories-title');
  });

  it('renders one anchor per category', () => {
    render(<LandingCategories categories={CATEGORIES_FIXTURE} />);
    expect(screen.getAllByRole('link')).toHaveLength(CATEGORIES_FIXTURE.items.length);
  });

  it('renders nothing when items is empty', () => {
    const { container } = render(
      <LandingCategories categories={{ ...CATEGORIES_FIXTURE, items: [] }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
