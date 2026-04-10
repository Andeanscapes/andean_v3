import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import OptimizedBackgroundImage from './OptimizedBackgroundImage';

describe('OptimizedBackgroundImage', () => {
  it('renders image with async decoding and lazy loading by default', () => {
    const { container } = render(
      <OptimizedBackgroundImage src="/assets/images/hero/h10.webp" />
    );

    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
  });
});
