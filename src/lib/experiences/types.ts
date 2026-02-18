// Generic Types for Experience Reservations

export type RoomMode = 'private' | 'couple';
export type TransportMode = 'car_no_4x4' | 'have_4x4' | 'bus';

export interface AvailableDate {
  id: string;
  startDate: string; // ISO 8601 UTC string (e.g., "2026-03-16T00:00:00.000Z")
  endDate: string;   // ISO 8601 UTC string (e.g., "2026-03-17T00:00:00.000Z")
  spots: number;
  isAvailable: boolean;
}

export interface ReservationContact {
  name: string;
  phone: string;
  email: string;
}

export interface ReservationPricing {
  basePricePerPerson: number;
  total: number;
  depositPercent: number;
  depositAmount: number;
}

export interface ReservationState {
  // Date selection
  selectedDateId: string | null;
  selectedDateLabel: string | null;
  availableSpots: number | null;

  // People
  peopleCount: number;
  roomMode: RoomMode;

  // Transport
  transportMode: TransportMode | null;

  // Contact
  contact: ReservationContact;

  // Terms
  termsAccepted: boolean;

  // Pricing
  pricing: ReservationPricing;

  // SSR hydration flag
  isHydrated: boolean;
}

export type ReservationAction =
  | {
      type: 'SET_DATE';
      payload: { id: string; label: string; spots: number };
    }
  | { type: 'SET_PEOPLE_COUNT'; payload: number }
  | { type: 'SET_ROOM_MODE'; payload: RoomMode }
  | { type: 'SET_TRANSPORT'; payload: TransportMode }
  | {
      type: 'SET_CONTACT';
      payload: { field: 'name' | 'phone' | 'email'; value: string };
    }
  | { type: 'SET_TERMS'; payload: boolean }
  | { type: 'HYDRATE'; payload: Partial<ReservationState> }
  | { type: 'RESET' };

export interface ReservationContextValue {
  state: ReservationState;
  dispatch: (action: ReservationAction) => void;
}

// Experience Configuration Interface
export interface ExperienceConfig {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  basePricePerPerson: number;
  depositPercent: number;
  maxPeople: number;
  minPeople: number;
  includesItems: string[];
  includesFullDetails: string;
  microcopy: {
    deposit: string;
    balance: string;
    security: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
}

export interface TransportOption {
  value: string;
  label: string;
  description: string;
}

export interface RoomModeOption {
  value: RoomMode;
  label: string;
  price_multiplier: number;
  fixed_people?: number;
}

// Consolidated experience data (ready for API responses)
export interface ExperienceData {
  config: ExperienceConfig;
  transportOptions: TransportOption[];
  roomModes: RoomModeOption[];
  availableDates: AvailableDate[];
  whatsappLink: string;
}
