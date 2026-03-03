import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Stepper } from './Stepper';

describe('Stepper', () => {
  it('renders stepper with initial value', () => {
    const handleChange = vi.fn();
    render(<Stepper value={5} onChange={handleChange} />);
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    expect(input.value).toBe('5');
  });

  it('increments value when + button is clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Stepper value={2} onChange={handleChange} />
    );

    const buttons = screen.getAllByRole('button');
    const incrementBtn = buttons[1];
    
    await user.click(incrementBtn);
    expect(handleChange).toHaveBeenCalledWith(3);
  });

  it('decrements value when - button is clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Stepper value={5} onChange={handleChange} />
    );

    const buttons = screen.getAllByRole('button');
    const decrementBtn = buttons[0];
    
    await user.click(decrementBtn);
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it('respects min value', async () => {
    const handleChange = vi.fn();
    render(
      <Stepper value={1} onChange={handleChange} min={1} />
    );

    const buttons = screen.getAllByRole('button');
    const decrementBtn = buttons[0];
    
    expect(decrementBtn).toBeDisabled();
  });

  it('respects max value', async () => {
    const handleChange = vi.fn();
    render(
      <Stepper value={4} onChange={handleChange} max={4} />
    );

    const buttons = screen.getAllByRole('button');
    const incrementBtn = buttons[1];
    
    expect(incrementBtn).toBeDisabled();
  });

  it('is disabled when disabled prop is true', () => {
    const handleChange = vi.fn();
    render(
      <Stepper value={2} onChange={handleChange} disabled />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it('renders with label', () => {
    const handleChange = vi.fn();
    render(
      <Stepper value={2} onChange={handleChange} label="People" />
    );
    expect(screen.getByText('People')).toBeInTheDocument();
  });
});
