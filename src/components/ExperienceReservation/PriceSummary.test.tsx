import { render, screen } from '@/test/test-utils';
import { describe, expect, it } from 'vitest';
import { PriceSummary } from './PriceSummary';

const defaultProps = { transportOptions: [], experienceTitle: 'Emerald Mining Adventure' };

describe('PriceSummary', () => {
  it('renders total price', () => {
    render(<PriceSummary {...defaultProps} />);
    expect(screen.getByText('Total:')).toBeInTheDocument();
  });

  it('renders deposit price', () => {
    render(<PriceSummary {...defaultProps} />);
    expect(screen.getByText(/Hoy pagas/)).toBeInTheDocument();
  });

  it('displays formatted prices', () => {
    render(<PriceSummary {...defaultProps} />);
    const prices = screen.getAllByText(/COP|\$/);
    expect(prices.length).toBeGreaterThan(0);
  });

  it('renders informational text', () => {
    render(<PriceSummary {...defaultProps} />);
    // With empty reservation state, the missing-step warning replaces the balance note.
    expect(screen.getByText(/Elige fecha/)).toBeInTheDocument();
  });
});
