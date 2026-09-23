import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import LandingCategoryCard from './LandingCategoryCard';
import { CATEGORIES_FIXTURE } from './__fixtures__/categoriesFixture';
import { getResponsiveImageSrc } from '@/utils/responsiveImage';

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

  /**
   * The tile used `next/image`, which resizes nothing on the deployed Worker, so
   * phones received the full-size desktop file. The `-mobile` sibling is derived
   * here rather than published, so nothing else would catch its removal.
   */
  it('serves the -mobile sibling below the desktop breakpoint', () => {
    const { container } = render(<LandingCategoryCard category={FIRST} />);
    const source = container.querySelector('picture > source');

    expect(source).toHaveAttribute('media', '(max-width: 767px)');
    expect(source).toHaveAttribute('srcset', getResponsiveImageSrc(FIRST.imageUrl).mobile);
    expect(container.querySelector('picture > img')).toHaveAttribute('src', FIRST.imageUrl);
  });

  it('lazy-loads the tile, which sits below the fold', () => {
    const { container } = render(<LandingCategoryCard category={FIRST} />);
    const img = container.querySelector('picture > img');

    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
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
