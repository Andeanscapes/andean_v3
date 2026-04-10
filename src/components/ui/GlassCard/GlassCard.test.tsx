import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GlassCard } from './GlassCard';

describe('GlassCard', () => {
  it('renders children', () => {
    render(<GlassCard>Content</GlassCard>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies light variant classes', () => {
    const { container } = render(<GlassCard variant="light">Light</GlassCard>);
    expect(container.firstChild).toHaveClass('bg-white');
  });
});
