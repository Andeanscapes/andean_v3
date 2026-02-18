import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Test content</Card>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies default styling', () => {
    const { container } = render(<Card>Test</Card>);
    const card = container.firstChild;
    expect(card).toHaveClass('card');
  });

  it('applies custom className', () => {
    const { container } = render(
      <Card className="custom-class">Test</Card>
    );
    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });

  it('applies padding variants', () => {
    const { container: container1 } = render(
      <Card padding="sm">Test</Card>
    );
    expect(container1.firstChild).toHaveClass('p-3');

    const { container: container2 } = render(
      <Card padding="lg">Test</Card>
    );
    expect(container2.firstChild).toHaveClass('p-8');
  });

  it('applies variant styles', () => {
    const { container } = render(
      <Card variant="outlined">Test</Card>
    );
    expect(container.firstChild).toHaveClass('border-2');
  });
});
