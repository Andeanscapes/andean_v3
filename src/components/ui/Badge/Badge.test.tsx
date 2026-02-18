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
});
