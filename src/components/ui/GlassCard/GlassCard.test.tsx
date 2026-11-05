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

  it('auto variant is light by default and switches surface via dark:', () => {
    const { container } = render(<GlassCard variant="auto">Auto</GlassCard>);
    expect(container.firstChild).toHaveClass('bg-white', 'shadow-card', 'dark:bg-slate-900/40');
  });

  it('hover effect gives border feedback without lifting the card', () => {
    const { container } = render(<GlassCard hoverEffect>Hover</GlassCard>);
    expect(container.firstChild).toHaveClass('hover:border-primary/40');
    expect((container.firstChild as HTMLElement).className).not.toMatch(/translate-y/);
  });
});
