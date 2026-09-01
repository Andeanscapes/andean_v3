import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import esMessages from '@/i18n/messages/es.json';
import { ExperienceReservationProvider } from '@/contexts/ExperienceReservationContext';
import type { ExperienceConfig, ExperienceData, RoomModeOption, AvailableDate } from '@/lib/schemas';

/**
 * Mock messages for next-intl testing
 */
/**
 * Real message bundle, not a mock subset.
 *
 * This was previously a hand-maintained excerpt, which drifted: a component
 * reading a key the excerpt lacked failed with MISSING_MESSAGE, and assertions
 * that read the real bundle disagreed with what was rendered. Using `es.json`
 * directly means a test can never pass against copy that does not exist, and
 * `render` below already pins the locale to `es`.
 */
const MOCK_MESSAGES = esMessages;

/**
 * Mock translated experience data for testing
 * Simulates what the Server Component with translations would pass
 */
const MOCK_TRANSLATED_CONFIG: ExperienceConfig = {
  id: 'emeraldMining',
  title: 'Aventura de Minería de Esmeraldas',
  subtitle: 'Experiencia todo incluido en Chivor (Boyacá), Colombia 🇨🇴',
  description: 'Descubre las profundidades de la mina de esmeraldas más famosa de Colombia',
  experiencePricePerPerson: 430000,
  currency: 'COP',
  numberOfNights: 1,
  depositPercent: 15,
  maxPeople: 10,
  minPeople: 1,
  microcopy: {
    deposit: 'Reserva con',
    balance: 'Saldo a pagar el día del tour',
    security: 'Pago 100% seguro con Mercado Pago',
    ctaPrimary: 'Paga 15% de depósito',
    ctaSecondary: '¿Dudas? WhatsApp',
  },
};

const MOCK_TRANSLATED_ROOM_MODES: RoomModeOption[] = [
  {
    value: 'standard_single' as const,
    label: 'Habitación Estándar (1)',
    price_multiplier: 1,
    fixed_people: 1,
    room_type_id: 'standard',
    units_available: 3,
  },
  {
    value: 'standard_couple' as const,
    label: 'Habitación Estándar (2)',
    price_multiplier: 1.1,
    fixed_people: 2,
    room_type_id: 'standard',
    units_available: 3,
  },
  {
    value: 'family_single' as const,
    label: 'Habitación Familiar (1)',
    price_multiplier: 1.05,
    fixed_people: 1,
    room_type_id: 'family',
    units_available: 1,
  },
  {
    value: 'family_couple' as const,
    label: 'Habitación Familiar (2)',
    price_multiplier: 1.05,
    fixed_people: 2,
    room_type_id: 'family',
    units_available: 1,
  },
  {
    value: 'family_3' as const,
    label: 'Habitación Familiar (3)',
    price_multiplier: 1.1,
    fixed_people: 3,
    room_type_id: 'family',
    units_available: 1,
  },
  {
    value: 'cabin_single' as const,
    label: 'Cabaña (1)',
    price_multiplier: 1.2,
    fixed_people: 1,
    room_type_id: 'cabin',
    units_available: 1,
  },
  {
    value: 'cabin_couple' as const,
    label: 'Cabaña (2)',
    price_multiplier: 1.2,
    fixed_people: 2,
    room_type_id: 'cabin',
    units_available: 1,
  },
  {
    value: 'cabin_6' as const,
    label: 'Cabaña (6)',
    price_multiplier: 1.3,
    fixed_people: 6,
    room_type_id: 'cabin',
    units_available: 1,
  },
];

const MOCK_AVAILABLE_DATES: AvailableDate[] = [
  { id: 'apr-11-2026', startDate: '2026-04-11T00:00:00.000Z', spots: 5, isAvailable: true },
  { id: 'apr-18-2026', startDate: '2026-04-18T00:00:00.000Z', spots: 4, isAvailable: true },
];

const MOCK_EXPERIENCE_DATA: ExperienceData = {
  config: MOCK_TRANSLATED_CONFIG,
  transportOptions: [
    { value: 'car_no_4x4', label: 'Carro Particular (No 4x4)', description: 'Aplica costo adicional' },
  ],
  roomModes: MOCK_TRANSLATED_ROOM_MODES,
  availableDates: MOCK_AVAILABLE_DATES,
  whatsappLink: 'https://wa.me/573001234567',
  inclusionsContent: {
    sectionTitle: 'Qué incluye',
    includedLabel: 'Incluido',
    notIncludedLabel: 'No incluido',
    logistics: [
      { id: 'duration', icon: 'clock', label: 'Duración', value: '2 días / 1 noche' },
      { id: 'transport', icon: 'car', label: 'Transporte', value: 'Carro Particular (No 4x4)' },
    ],
    included: [
      { id: 'inc-1', title: 'Guía especializado' },
      { id: 'inc-2', title: 'Equipo de seguridad' },
    ],
    notIncluded: [],
  },
  itineraryContent: {
    sectionTitle: 'Itinerario Interactivo',
    days: [
      {
        day: 1,
        label: 'Día 1 — Llegada y mina',
        stops: [
          {
            time: '11:00 AM',
            title: 'Registro y bienvenida',
            shortDescription: 'Punto de encuentro en Chivor',
            categoryIcon: 'Gem',
          },
          {
            time: '2:00 PM',
            title: 'Visita a la mina',
            shortDescription: 'Exploración guiada de los túneles',
            categoryIcon: 'Mountain',
          },
        ],
      },
    ],
  },
};

/**
 * Custom render function that wraps components with required providers
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <NextIntlClientProvider locale="es" messages={MOCK_MESSAGES} timeZone="UTC">
        <ExperienceReservationProvider
          config={MOCK_TRANSLATED_CONFIG}
          roomModes={MOCK_TRANSLATED_ROOM_MODES}
          availableDates={MOCK_AVAILABLE_DATES}
        >
          {children}
        </ExperienceReservationProvider>
      </NextIntlClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

export * from '@testing-library/react';
export { customRender as render };
export { MOCK_TRANSLATED_CONFIG, MOCK_TRANSLATED_ROOM_MODES, MOCK_EXPERIENCE_DATA };
