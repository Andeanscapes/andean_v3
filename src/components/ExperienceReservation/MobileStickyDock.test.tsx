import { useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';
import { ExperienceReservationProvider } from '@/contexts/ExperienceReservationContext';
import { useReservationDispatch } from '@/hooks/experiences/useReservationContext';
import type { AccommodationTiersContent, AvailableDate, ExperienceConfig, RoomModeOption, TransportOption } from '@/lib/schemas';
import { MobileStickyDock } from './MobileStickyDock';

const messages = {
  experiences: {
    ui: {
      payTodayLabel: 'Hoy pagas',
      validationError: 'Error en la validación',
      totalLabel: 'Total',
      mobileDockSummaryLabel: 'Tu reserva',
      mobileDockEmptySummary: 'Elige fecha, personas y alojamiento',
      mobileDockPeopleSummary: '{count, plural, one {# persona} other {# personas}}',
      mobileDockViewDetails: 'Detalles',
      mobileDockHideDetails: 'Ocultar',
      mobileDockDate: 'Fecha',
      mobileDockPeople: 'Personas',
      mobileDockStay: 'Alojamiento',
      mobileDockRoom: 'Habitación',
      mobileDockTransport: 'Transporte',
      mobileDockNotSelected: 'Sin seleccionar',
      mobileDockMissingDate: 'Elige fecha',
      mobileDockMissingRooms: 'Elige habitación',
      mobileDockMissingTransport: 'Elige transporte',
      mobileDockMissingContact: 'Completa tus datos',
      mobileDockMissingTerms: 'Acepta términos',
      mobileDockTrustLine: '12 reservaron recientemente · Pago seguro',
    },
  },
};

const config: ExperienceConfig = {
  id: 'emeraldMining',
  title: 'Aventura de Minería de Esmeraldas',
  subtitle: 'Chivor',
  description: 'Experiencia minera',
  experiencePricePerPerson: 350000,
  currency: 'COP',
  numberOfNights: 1,
  depositPercent: 15,
  maxPeople: 10,
  minPeople: 1,
  microcopy: {
    deposit: 'Reserva con',
    balance: 'Saldo al llegar',
    security: 'Pago seguro',
    ctaPrimary: 'Paga 15% de depósito',
    ctaSecondary: 'WhatsApp',
  },
};

const roomModes: RoomModeOption[] = [
  {
    value: 'standard_single',
    label: 'Habitación Estándar (1)',
    price_multiplier: 1,
    fixed_people: 1,
    room_type_id: 'standard',
    units_available: 3,
    tier_id: 'heritage',
  },
];

const availableDates: AvailableDate[] = [
  { id: 'may-02-2026', startDate: '2026-05-02T00:00:00.000Z', spots: 5, isAvailable: true },
];

const accommodationTiersContent: AccommodationTiersContent = {
  sectionTitle: 'Alojamiento',
  tiers: [
    {
      id: 'heritage',
      tierTag: 'Heritage / Traditional',
      tierLabel: 'Hacienda El Recuerdo',
      tierDescription: 'Estadía tradicional',
      images: {
        main: '/heritage.webp',
        gallery: [],
      },
      quickSpecs: {
        hasPrivateBathroom: true,
        hasWifi: true,
      },
      rooms: [
        {
          id: 'standard',
          label: 'Habitación Estándar',
          capacity: 1,
          pricePerNight: 0,
        },
      ],
    },
  ],
};

const transportOptions: TransportOption[] = [
  { value: 'car_no_4x4', label: 'Carro Particular (No 4x4)', description: 'Aplica costo adicional' },
];

function SeedSelections() {
  const dispatch = useReservationDispatch();

  useEffect(() => {
    const id = window.setTimeout(() => {
      dispatch({ type: 'SET_TIER', payload: 'heritage' });
      dispatch({ type: 'SET_DATE', payload: { id: 'may-02-2026', label: 'May 2, 2026', spots: 5 } });
      dispatch({ type: 'SET_ROOM_SELECTIONS', payload: [{ roomMode: 'standard_single', quantity: 1 }] });
      dispatch({ type: 'SET_TRANSPORT', payload: 'car_no_4x4' });
    }, 0);

    return () => window.clearTimeout(id);
  }, [dispatch]);

  return null;
}

function renderDock(seed = false) {
  return render(
    <NextIntlClientProvider locale="es" messages={messages} timeZone="UTC">
      <ExperienceReservationProvider
        config={config}
        roomModes={roomModes}
        accommodationTiersContent={accommodationTiersContent}
        availableDates={availableDates}
      >
        {seed && <SeedSelections />}
        <MobileStickyDock config={config} transportOptions={transportOptions} />
      </ExperienceReservationProvider>
    </NextIntlClientProvider>
  );
}

describe('MobileStickyDock', () => {
  it('renders compact empty summary and missing date hint by default', () => {
    renderDock();

    expect(screen.getByText('Tu reserva')).toBeInTheDocument();
    expect(screen.getByText('Elige fecha, personas y alojamiento')).toBeInTheDocument();
    expect(screen.getByText('Elige fecha')).toBeInTheDocument();
    expect(screen.getByText('Paga 15% de depósito')).toBeInTheDocument();
  });

  it('shows selected booking details in expanded summary', async () => {
    const user = userEvent.setup();
    renderDock(true);

    await waitFor(() => {
      expect(screen.getByText(/May 2, 2026 · 1 persona · Hacienda El Recuerdo/)).toBeInTheDocument();
    });

    await user.click(screen.getByText('Tu reserva').closest('button') as HTMLButtonElement);

    expect(screen.getByText('Fecha')).toBeInTheDocument();
    expect(screen.getByText('May 2, 2026')).toBeInTheDocument();
    expect(screen.getByText('Hacienda El Recuerdo')).toBeInTheDocument();
    expect(screen.getByText('1 x Habitación Estándar (1)')).toBeInTheDocument();
    expect(screen.getByText('Carro Particular (No 4x4)')).toBeInTheDocument();
    expect(screen.getAllByText('Completa tus datos')).toHaveLength(2);
  });
});
