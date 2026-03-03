import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { TransportOptions } from './TransportOptions';

// Mock translated transport options (simulates SSR translation)
const MOCK_TRANSPORT_OPTIONS = [
  {
    value: 'car_no_4x4',
    label: 'Carro Particular (No 4x4)',
    description: 'Aplica costo adicional de transporte 4x4 local',
  },
  {
    value: 'have_4x4',
    label: 'Tengo 4x4',
    description: 'Sin costo adicional',
  },
  {
    value: 'bus',
    label: 'Bus Público',
    description: 'Traslado local incluido desde terminal',
  },
];

describe('TransportOptions', () => {
  it('renders title', () => {
    render(<TransportOptions transportOptions={MOCK_TRANSPORT_OPTIONS} />);
    expect(screen.getByText(/Punto de inicio/)).toBeInTheDocument();
  });

  it('renders all transport options from config', () => {
    render(<TransportOptions transportOptions={MOCK_TRANSPORT_OPTIONS} />);
    expect(screen.getByText('Carro Particular (No 4x4)')).toBeInTheDocument();
    expect(screen.getByText('Tengo 4x4')).toBeInTheDocument();
    expect(screen.getByText('Bus Público')).toBeInTheDocument();
  });

  it('selects option when clicked', async () => {
    const user = userEvent.setup();
    render(<TransportOptions transportOptions={MOCK_TRANSPORT_OPTIONS} />);

    const radios = screen.getAllByRole('radio');
    await user.click(radios[1]);

    expect((radios[1] as HTMLInputElement).checked).toBe(true);
  });
});
