import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PrimaryCtaButton } from './PrimaryCtaButton';

describe('PrimaryCtaButton', () => {
  it('renders as button by default', () => {
    render(<PrimaryCtaButton>Book now</PrimaryCtaButton>);
    expect(screen.getByRole('button', { name: 'Book now' })).toBeInTheDocument();
  });

  it('renders as link when href is provided', () => {
    render(<PrimaryCtaButton href="/booking">Check Dates</PrimaryCtaButton>);
    const link = screen.getByRole('link', { name: 'Check Dates' });
    expect(link).toHaveAttribute('href', '/booking');
  });
});
