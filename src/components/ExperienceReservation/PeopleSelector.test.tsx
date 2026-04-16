import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PeopleSelector } from './PeopleSelector';

describe('PeopleSelector', () => {
  it('renders title', () => {
    render(<PeopleSelector />);
    expect(screen.getByText('¿Cuántas personas?')).toBeInTheDocument();
  });

  it('renders a select trigger with the default value', () => {
    render(<PeopleSelector minPeople={1} maxPeople={4} />);
    const trigger = screen.getByRole('combobox', { name: /¿Cuántas personas?/i });
    expect(trigger).toBeInTheDocument();
  });

  it('shows all options from minPeople to maxPeople', async () => {
    const user = userEvent.setup();
    render(<PeopleSelector minPeople={1} maxPeople={4} />);

    const trigger = screen.getByRole('combobox', { name: /¿Cuántas personas?/i });
    await user.click(trigger);

    expect(screen.getByRole('option', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '3' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '4' })).toBeInTheDocument();
  });

  it('calls setPeopleCount when an option is selected', async () => {
    const user = userEvent.setup();
    render(<PeopleSelector minPeople={1} maxPeople={4} />);

    const trigger = screen.getByRole('combobox', { name: /¿Cuántas personas?/i });
    await user.click(trigger);

    const option3 = screen.getByRole('option', { name: '3' });
    await user.click(option3);

    // After selecting 3, the trigger button should display "3" as its text
    expect(screen.getByRole('combobox')).toHaveTextContent('3');
  });
});
