import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ContactFields } from './ContactFields';

describe('ContactFields', () => {
  it('renders title', () => {
    render(<ContactFields />);
    expect(screen.getByText(/Datos para confirmar/)).toBeInTheDocument();
  });

  it('renders all input fields', () => {
    render(<ContactFields />);
    expect(screen.getByPlaceholderText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('+57 300 123 4567')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument();
  });

  it('updates name field', async () => {
    const user = userEvent.setup();
    render(<ContactFields />);

    const nameInput = screen.getByPlaceholderText(
      'Juan Pérez'
    ) as HTMLInputElement;
    await user.type(nameInput, 'John Doe');

    expect(nameInput.value).toBe('John Doe');
  });

  it('updates phone field', async () => {
    const user = userEvent.setup();
    render(<ContactFields />);

    const phoneInput = screen.getByPlaceholderText(
      '+57 300 123 4567'
    ) as HTMLInputElement;
    await user.type(phoneInput, '+573001234567');

    expect(phoneInput.value).toBe('+573001234567');
  });
});
