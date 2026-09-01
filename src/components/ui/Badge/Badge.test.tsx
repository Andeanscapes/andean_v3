import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Badge onClick={handleClick}>Click me</Badge>);

    const badge = screen.getByRole('button');
    await user.click(badge);

    expect(handleClick).toHaveBeenCalled();
  });

  it('applies variant classes', () => {
    const { container } = render(
      <Badge variant="success">Success</Badge>
    );
    expect(container.firstChild).toHaveClass('badge-success');
  });

  it('applies size classes', () => {
    const { container } = render(
      <Badge size="lg">Large</Badge>
    );
    expect(container.firstChild).toHaveClass('badge-lg');
  });

  it('shows ring when selected', () => {
    const { container } = render(
      <Badge selected>Selected</Badge>
    );
    expect(container.firstChild).toHaveClass('ring-2');
  });

  it('applies disabled styling', () => {
    const { container } = render(
      <Badge disabled>Disabled</Badge>
    );
    expect(container.firstChild).toHaveClass('opacity-60');
  });

  it('does not trigger onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Badge disabled onClick={handleClick}>Disabled</Badge>);

    const badge = screen.getByText('Disabled');
    await user.click(badge);

    expect(handleClick).not.toHaveBeenCalled();
  });

  describe('interactive affordance', () => {
    it('is not focusable and shows no pointer cursor without onClick', () => {
      const { container } = render(<Badge>Static</Badge>);
      const badge = container.firstChild as HTMLElement;

      expect(badge).not.toHaveClass('cursor-pointer');
      expect(badge).not.toHaveAttribute('role');
      expect(badge).not.toHaveAttribute('tabindex');
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('is a focusable button with a pointer cursor when given onClick', () => {
      const { container } = render(<Badge onClick={vi.fn()}>Action</Badge>);
      const badge = container.firstChild as HTMLElement;

      expect(badge).toHaveClass('cursor-pointer');
      expect(badge).toHaveAttribute('role', 'button');
      expect(badge).toHaveAttribute('tabindex', '0');
    });

    it('drops the interactive affordance when disabled', () => {
      const { container } = render(
        <Badge disabled onClick={vi.fn()}>Disabled</Badge>
      );
      const badge = container.firstChild as HTMLElement;

      expect(badge).not.toHaveClass('cursor-pointer');
      expect(badge).toHaveClass('cursor-not-allowed');
      expect(badge).not.toHaveAttribute('role');
    });

    it('activates via Enter and Space when interactive', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Badge onClick={handleClick}>Action</Badge>);

      const badge = screen.getByRole('button');
      badge.focus();

      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);

      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });
});
