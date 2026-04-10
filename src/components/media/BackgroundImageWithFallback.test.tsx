import { render, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import BackgroundImageWithFallback from './BackgroundImageWithFallback';

describe('BackgroundImageWithFallback', () => {
  it('renders an image element through the lazy wrapper', async () => {
    const { container } = render(
      <BackgroundImageWithFallback src="/assets/images/hero/h10.webp" />
    );

    await waitFor(() => {
      expect(container.querySelector('img')).toBeInTheDocument();
    });
  });
});
