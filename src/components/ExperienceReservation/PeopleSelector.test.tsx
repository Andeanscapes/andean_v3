import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PeopleSelector } from './PeopleSelector';

describe('PeopleSelector', () => {
  it('renders title', () => {
    render(<PeopleSelector />);
    expect(screen.getByText('¿Cuántas personas?')).toBeInTheDocument();
  });

  it('renders stepper with initial value', () => {
    render(<PeopleSelector />);
    const spinbutton = screen.getByRole('spinbutton') as HTMLInputElement;
    expect(spinbutton.value).toBe('2');
  });

  it('renders room mode options', () => {
    render(<PeopleSelector />);
    expect(screen.getByText('Privado')).toBeInTheDocument();
    expect(screen.getByText('Pareja')).toBeInTheDocument();
  });

  it('disables stepper when couple mode is selected', async () => {
    const user = userEvent.setup();
    render(<PeopleSelector />);

    const parejaBtn = screen.getByRole('button', { name: 'Pareja' });
    await user.click(parejaBtn);

    await waitFor(() => {
      const spinbutton = screen.getByRole('spinbutton');
      expect(spinbutton).toBeDisabled();
      expect((spinbutton as HTMLInputElement).value).toBe('2');
    });
  });
});
