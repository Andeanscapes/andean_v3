import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SegmentedControl } from './SegmentedControl';

describe('SegmentedControl', () => {
  const options = [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
    { label: 'Option 3', value: 'opt3' },
  ];

  it('renders all options', () => {
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        options={options}
        value="opt1"
        onChange={handleChange}
      />
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('calls onChange when option is clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        options={options}
        value="opt1"
        onChange={handleChange}
      />
    );

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[1]);

    expect(handleChange).toHaveBeenCalledWith('opt2');
  });

  it('marks active option correctly', () => {
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        options={options}
        value="opt2"
        onChange={handleChange}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[1]).toHaveClass('btn-primary');
    expect(buttons[0]).not.toHaveClass('btn-primary');
  });

  it('is disabled when disabled prop is true', () => {
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        options={options}
        value="opt1"
        onChange={handleChange}
        disabled
      />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });
});
