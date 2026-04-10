import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { ExperienceReservationProvider } from '@/contexts/ExperienceReservationContext';
import type { ExperienceConfig, RoomModeOption } from '@/lib/schemas';

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
      limitedSpotsShort: 'Cupos',
      officialDates: 'Fechas oficiales',
      depositLabel: 'Depósito',
      heroCta: 'Ver fechas',
      heroSummary: '2D/1N • Visita a la mina + taller de esmeraldas • Inicio en Chivor • Grupos pequeños',
      totalLabel: 'Total',
      payTodayLabel: 'Hoy pagas',
      balanceNote: 'Saldo se paga el día del tour. Confirmación inmediata.',
      termsCheckbox: 'Acepto términos y condiciones',
      completeRequiredFields: 'Completa todos los campos requeridos para continuar',
      processing: 'Procesando...',
      paymentMethods: 'Tarjeta · PSE · Pago seguro',
      validationError: 'Error en la validación',
      scrollHint: 'Desliza para ver mas fechas',
      selectedDateLabel: 'Seleccionada',
      howManyPeople: '¿Cuántas personas?',
      peopleLabel: 'Personas',
      roomType: 'Tipo de habitación:',
      guestsPerRoom: 'Huéspedes por habitación',
      numberOfRooms: 'Cantidad de habitaciones',
      guests: 'huéspedes',
      privateBathroom: 'baño privado',
      private: 'Privado',
      couple: 'Pareja',
      roomMixHint: 'Puedes combinar varios tipos de habitación',
      coupleNote: '💑 Pareja simplifica la decisión a 2 personas en habitación compartida.',
      contactDataTitle: 'Datos para confirmar tu cupo',
        selectedRoomsLabel: 'Habitaciones seleccionadas',
        clearSelection: 'Limpiar',
        noRoomsSelected: 'Ninguna habitación seleccionada',
        addRoom: 'Agregar habitación',
        roomSelectionTitle: 'Elige habitaciones',
        closeModal: 'Cerrar',
      fullName: 'Nombre completo',
      fullNamePlaceholder: 'Juan Pérez',
          unitsAvailable: '{count} disponibles',
      phone: 'Celular',
      phonePlaceholder: '+57 300 123 4567',
      email: 'Email',
      emailPlaceholder: 'tu@email.com',
      emailHelper: 'Opcional - para confirmación adicional',
      startingPoint: 'Punto de inicio: Chivor (casco urbano)',
      howToArrive: '¿Cómo llegas?',
      roomMode: {
        standard: 'Habitación Estándar',
        family: 'Habitación Familiar',
        cabin: 'Cabaña',
      },
    },
    common: {
      deposit: 'Reserva con',
      balance: 'Saldo a pagar el día del tour',
      security: 'Pago 100% seguro con Mercado Pago',
      ctaPrimary: 'Paga 15% de depósito',
      ctaSecondary: '¿Dudas? WhatsApp',
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
  subtitle: 'Experiencia todo incluido en Chivor (Boyacá), Colombia 🇨🇴',
  description: 'Descubre las profundidades de la mina de esmeraldas más famosa de Colombia',
  experiencePricePerPerson: 430000,
  numberOfNights: 1,
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
