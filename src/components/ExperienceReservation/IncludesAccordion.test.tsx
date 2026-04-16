import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { IncludesAccordion } from './IncludesAccordion';
import { MOCK_EXPERIENCE_DATA } from '@/test/test-utils';

describe('IncludesAccordion', () => {
  it('renders accordion title', () => {
    render(<IncludesAccordion experienceData={MOCK_EXPERIENCE_DATA} />);
    expect(screen.getByText('¿Qué incluye?')).toBeInTheDocument();
  });

  it('renders all includes items from config', () => {
    render(<IncludesAccordion experienceData={MOCK_EXPERIENCE_DATA} />);
    MOCK_EXPERIENCE_DATA.config.includesItems.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it('has details button', () => {
    render(<IncludesAccordion experienceData={MOCK_EXPERIENCE_DATA} />);
    expect(screen.getByText('Ver detalles completos')).toBeInTheDocument();
  });

  it('opens itinerary modal when clicking view full details', async () => {
    const user = userEvent.setup();
    render(<IncludesAccordion experienceData={MOCK_EXPERIENCE_DATA} />);

    await user.click(screen.getByText('Ver detalles completos'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Itinerario Interactivo')).toBeInTheDocument();
  });

  it('renders itinerary days and stops in modal', async () => {
    const user = userEvent.setup();
    render(<IncludesAccordion experienceData={MOCK_EXPERIENCE_DATA} />);

    await user.click(screen.getByText('Ver detalles completos'));
    expect(screen.getByText('Día 1 — Llegada y mina')).toBeInTheDocument();
    expect(screen.getByText('Registro y bienvenida')).toBeInTheDocument();
    expect(screen.getByText('Visita a la mina')).toBeInTheDocument();
  });
});
