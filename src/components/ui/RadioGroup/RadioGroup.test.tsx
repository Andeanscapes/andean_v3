import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RadioGroup } from './RadioGroup';

describe('RadioGroup', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2', description: 'Description' },
    { value: 'option3', label: 'Option 3' },
  ];

  it('renders all options', () => {
    const handleChange = vi.fn();
    render(
      <RadioGroup
        name="test"
        options={options}
        value={null}
        onChange={handleChange}
      />
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('renders with label', () => {
    const handleChange = vi.fn();
    render(
      <RadioGroup
        name="test"
        options={options}
        value={null}
        onChange={handleChange}
        label="Choose one"
      />
    );

    expect(screen.getByText('Choose one')).toBeInTheDocument();
  });

  it('calls onChange when option is selected', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <RadioGroup
        name="test"
        options={options}
        value={null}
        onChange={handleChange}
      />
    );

    const inputs = screen.getAllByRole('radio');
    await user.click(inputs[1]);

    expect(handleChange).toHaveBeenCalledWith('option2');
  });

  it('shows error message when provided', () => {
    const handleChange = vi.fn();
    render(
      <RadioGroup
        name="test"
        options={options}
        value={null}
        onChange={handleChange}
        errorMessage="This field is required"
      />
    );

    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('marks correct option as checked', () => {
    const handleChange = vi.fn();
    render(
      <RadioGroup
        name="test"
        options={options}
        value="option2"
        onChange={handleChange}
      />
    );

    const inputs = screen.getAllByRole('radio') as HTMLInputElement[];
    expect(inputs[1].checked).toBe(true);
    expect(inputs[0].checked).toBe(false);
  });
});
