import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { ExperienceReservationProvider } from '@/contexts/ExperienceReservationContext';
import type { ExperienceConfig, RoomModeOption } from '@/lib/experiences/types';

/**
 * Mock messages for next-intl testing
 */
const MOCK_MESSAGES = {
  experiences: {
    ui: {
      availableDates: 'Fechas disponibles',
      spotsAvailable: '{count, plural, one {# cupo} other {# cupos}}',
      controlledDatesNote: 'Fechas controladas para logística.',
      limitedSpots: 'Cupos limitados',
      officialDates: 'Fechas oficiales',
      depositLabel: 'Depósito',
      howManyPeople: '¿Cuántas personas?',
      peopleLabel: 'Personas',
      roomType: 'Tipo de habitación:',
      private: 'Privado',
      couple: 'Pareja',
      coupleNote: '💑 Pareja simplifica la decisión a 2 personas en habitación compartida.',
      contactDataTitle: 'Datos para confirmar tu cupo',
      fullName: 'Nombre completo',
      fullNamePlaceholder: 'Juan Pérez',
      phone: 'Celular',
      phonePlaceholder: '+57 300 123 4567',
      email: 'Email',
      emailPlaceholder: 'tu@email.com',
      emailHelper: 'Opcional - para confirmación adicional',
      startingPoint: 'Punto de inicio: Chivor (casco urbano)',
      howToArrive: '¿Cómo llegas?',
    },
    common: {
      deposit: 'Reserva con',
      balance: 'Saldo a pagar el día del tour',
      security: 'Pago 100% seguro con Mercado Pago',
      ctaPrimary: 'Reservar ahora',
      ctaSecondary: 'Consultar por WhatsApp',
    },
    emeraldMining: {
      transport: {
        carNo4x4: 'Carro Particular (No 4x4)',
        carNo4x4Description: 'Aplica costo adicional de transporte 4x4 local',
        have4x4: 'Tengo 4x4',
        have4x4Description: 'Sin costo adicional',
        bus: 'Bus Público',
        busDescription: 'Traslado local incluido desde terminal',
      },
    },
  },
};

/**
 * Mock translated experience data for testing
 * Simulates what the Server Component with translations would pass
 */
const MOCK_TRANSLATED_CONFIG: ExperienceConfig = {
  id: 'emeraldMining',
  title: 'Aventura de Minería de Esmeraldas',
  subtitle: 'Experiencia única en Muzo',
  description: 'Descubre las profundidades de la mina de esmeraldas más famosa de Colombia',
  basePricePerPerson: 430000,
  depositPercent: 15,
  maxPeople: 10,
  minPeople: 1,
  includesItems: [
    'Guía especializado',
    'Equipo de seguridad',
    'Transporte ida y vuelta',
    'Seguro de accidentes',
  ],
  includesFullDetails:
    'Incluye guía especializado bilingüe, todo el equipo de seguridad necesario',
  microcopy: {
    deposit: 'Reserva con',
    balance: 'Saldo a pagar el día del tour',
    security: 'Pago 100% seguro con Mercado Pago',
    ctaPrimary: 'Reservar ahora',
    ctaSecondary: 'Consultar por WhatsApp',
  },
};

const MOCK_TRANSLATED_ROOM_MODES: RoomModeOption[] = [
  {
    value: 'private' as const,
    label: 'Habitación Privada',
    price_multiplier: 1,
  },
  {
    value: 'couple' as const,
    label: 'Habitación de Pareja',
    price_multiplier: 1.2,
    fixed_people: 2,
  },
];

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
export { MOCK_TRANSLATED_CONFIG, MOCK_TRANSLATED_ROOM_MODES };
