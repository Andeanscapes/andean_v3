import { render, screen } from '@/test/test-utils';
import { describe, expect, it } from 'vitest';
import { PriceSummary } from './PriceSummary';

describe('PriceSummary', () => {
  it('renders total price', () => {
    render(<PriceSummary />);
    expect(screen.getByText('Total:')).toBeInTheDocument();
  });

  it('renders deposit price', () => {
    render(<PriceSummary />);
    expect(screen.getByText(/Hoy pagas/)).toBeInTheDocument();
  });

  it('displays formatted prices', () => {
    render(<PriceSummary />);
    const prices = screen.getAllByText(/\$/);
    expect(prices.length).toBeGreaterThan(0);
  });

  it('renders informational text', () => {
    render(<PriceSummary />);
    expect(screen.getByText(/Saldo se paga/)).toBeInTheDocument();
  });
});
