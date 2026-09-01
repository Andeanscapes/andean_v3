import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ExperienceData } from '@/lib/schemas';
import OptionalExtras from './OptionalExtras';

vi.mock('next-intl', () => ({
  useLocale: () => 'es',
}));

// The component reads only `addonsContent`, so a partial is sufficient and
// keeps the test honest instead of casting a stub to the full ExperienceData.
type OptionalExtrasData = Pick<ExperienceData, 'addonsContent' | 'config'>;

/** Only the currency is read off `config`, so the rest is not modelled here. */
const CONFIG = { currency: 'COP' } as ExperienceData['config'];

function buildData(addonsContent?: ExperienceData['addonsContent']): OptionalExtrasData {
  return { addonsContent, config: CONFIG };
}

const addonsContent: NonNullable<ExperienceData['addonsContent']> = {
  sectionTitle: 'Adicionales opcionales',
  perPersonLabel: 'por persona',
  teamConfirmationLabel: 'El equipo confirma disponibilidad y valor final',
  items: [
    {
      id: 'apiary_cattle',
      label: 'Apicultura y ganadería',
      description: 'Actividades guiadas.',
      pricePerPerson: 55000,
      requiresTeamConfirmation: true,
    },
    {
      id: 'horseback_riding',
      label: 'Cabalgata guiada',
      pricePerPerson: 120000,
    },
  ],
};

describe('OptionalExtras', () => {
  it('renders nothing when there are no addons', () => {
    const { container } = render(<OptionalExtras experienceData={buildData()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the addon list is empty', () => {
    const { container } = render(
      <OptionalExtras experienceData={buildData({ ...addonsContent, items: [] })} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders each addon with its per-person price', () => {
    render(<OptionalExtras experienceData={buildData(addonsContent)} />);

    expect(screen.getByRole('heading', { name: 'Adicionales opcionales' })).toBeInTheDocument();
    expect(screen.getByText('Apicultura y ganadería')).toBeInTheDocument();
    expect(screen.getByText('Cabalgata guiada')).toBeInTheDocument();

    // COP, no decimals — exact separator is locale/ICU dependent.
    expect(screen.getByText(/55[.,]000/)).toBeInTheDocument();
    expect(screen.getByText(/120[.,]000/)).toBeInTheDocument();
    expect(screen.getAllByText('por persona')).toHaveLength(2);
  });

  it('shows the confirmation badge only for addons that require it', () => {
    render(<OptionalExtras experienceData={buildData(addonsContent)} />);

    expect(
      screen.getAllByText('El equipo confirma disponibilidad y valor final'),
    ).toHaveLength(1);
  });

  it('renders a description only when present', () => {
    render(<OptionalExtras experienceData={buildData(addonsContent)} />);

    expect(screen.getByText('Actividades guiadas.')).toBeInTheDocument();
  });

  it('is display-only — nothing in the section is interactive', () => {
    render(<OptionalExtras experienceData={buildData(addonsContent)} />);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });

  it('presents the extras as a semantic list', () => {
    render(<OptionalExtras experienceData={buildData(addonsContent)} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});
