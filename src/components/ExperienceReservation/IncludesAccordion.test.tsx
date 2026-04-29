import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { IncludesAccordion } from './IncludesAccordion';
import { MOCK_EXPERIENCE_DATA } from '@/test/test-utils';

describe('IncludesAccordion', () => {
  it('renders included items section header', () => {
    render(<IncludesAccordion experienceData={MOCK_EXPERIENCE_DATA} />);
    // whatIsIncluded translation key → '¿Qué incluye?'
    expect(screen.getByText('¿Qué incluye?')).toBeInTheDocument();
  });

  it('renders included items from inclusionsContent', () => {
    render(<IncludesAccordion experienceData={MOCK_EXPERIENCE_DATA} />);
    expect(screen.getByText('Guía especializado')).toBeInTheDocument();
    expect(screen.getByText('Equipo de seguridad')).toBeInTheDocument();
  });

  it('renders logistics items from inclusionsContent', () => {
    render(<IncludesAccordion experienceData={MOCK_EXPERIENCE_DATA} />);
    expect(screen.getByText('Duración')).toBeInTheDocument();
    expect(screen.getByText('2 días / 1 noche')).toBeInTheDocument();
  });

  it('has view full details button', () => {
    render(<IncludesAccordion experienceData={MOCK_EXPERIENCE_DATA} />);
    // viewFullDetails translation key → 'Ver detalles completos'
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
