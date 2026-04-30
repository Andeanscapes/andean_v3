import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import FloatingWhatsApp from './FloatingWhatsApp';

const HREF = 'https://wa.me/573001234567';
const LABEL = 'Chat with us on WhatsApp';

describe('FloatingWhatsApp', () => {
  afterEach(() => {
    cleanup();
    window.scrollY = 0;
  });

  it('renders an external link with proper attributes', () => {
    render(<FloatingWhatsApp href={HREF} ariaLabel={LABEL} />);
    const link = screen.getByRole('link', { name: LABEL });
    expect(link).toHaveAttribute('href', HREF);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('is hidden initially (opacity-0) and becomes visible after scroll', () => {
    render(<FloatingWhatsApp href={HREF} ariaLabel={LABEL} showAfter={100} />);
    const link = screen.getByRole('link', { name: LABEL });
    expect(link.className).toMatch(/opacity-0/);

    act(() => {
      window.scrollY = 250;
      fireEvent.scroll(window);
    });

    expect(link.className).toMatch(/opacity-100/);
  });
});
