'use client';

import { useReducer, useEffect, useMemo, type ReactNode } from 'react';
import { createContext } from 'use-context-selector';
import type {
  ReservationState,
  ReservationAction,
  ReservationContextValue,
  ExperienceConfig,
  RoomModeOption,
  RoomSelection,
} from '@/lib/schemas';
import { calculatePricing, computePeopleCount } from '@/utils/helpers';
import { createReservationStorage } from '@/utils/reservationStorage';

export const ExperienceReservationContext =
  createContext<ReservationContextValue | null>(null);

interface ExperienceReservationProviderProps {
  children: ReactNode;
  config: ExperienceConfig;
  roomModes: RoomModeOption[];
}

function createInitialState(
  experiencePricePerPerson: number,
  depositPercent: number,
  roomModes: RoomModeOption[]
): ReservationState {
  const roomSelections: RoomSelection[] = [];
  const peopleCount = computePeopleCount(roomSelections, roomModes);
  return {
    selectedDateId: null,
    selectedDateLabel: null,
    availableSpots: null,
    peopleCount,
    roomSelections,
    transportMode: null,
    contact: {
      name: '',
      phone: '',
      email: '',
    },
    termsAccepted: false,
    pricing: calculatePricing(
      experiencePricePerPerson,
      depositPercent,
      roomModes,
      roomSelections
    ),
    isHydrated: false,
  };
}

function createReservationReducer(
  experiencePricePerPerson: number,
  depositPercent: number,
  roomModes: RoomModeOption[]
) {
  return function reservationReducer(
    state: ReservationState,
    action: ReservationAction
  ): ReservationState {
    switch (action.type) {
      case 'SET_DATE': {
        return {
          ...state,
          selectedDateId: action.payload.id,
          selectedDateLabel: action.payload.label,
          availableSpots: action.payload.spots,
        };
      }

      case 'SET_ROOM_SELECTIONS': {
        const peopleCount = computePeopleCount(action.payload, roomModes);
        return {
          ...state,
          roomSelections: action.payload,
          peopleCount,
          pricing: calculatePricing(
            experiencePricePerPerson,
            depositPercent,
            roomModes,
            action.payload
          ),
        };
      }

      case 'SET_TRANSPORT': {
        return {
          ...state,
          transportMode: action.payload,
        };
      }

      case 'SET_CONTACT': {
        return {
          ...state,
          contact: {
            ...state.contact,
            [action.payload.field]: action.payload.value,
          },
        };
      }

      case 'SET_TERMS': {
        return {
          ...state,
          termsAccepted: action.payload,
        };
      }

      case 'HYDRATE': {
        const payload = action.payload as Partial<ReservationState> & {
          roomMode?: RoomSelection['roomMode'];
        };
        const roomSelections = Array.isArray(payload.roomSelections)
          ? payload.roomSelections
          : payload.roomMode
            ? [{ roomMode: payload.roomMode, quantity: 1 }]
            : state.roomSelections;
        const hydrated: ReservationState = {
          ...state,
          ...payload,
          roomSelections,
          peopleCount: computePeopleCount(roomSelections, roomModes),
          isHydrated: true,
        };
        // Recalculate pricing based on hydrated values
        hydrated.pricing = calculatePricing(
          experiencePricePerPerson,
          depositPercent,
          roomModes,
          hydrated.roomSelections
        );
        return hydrated;
      }

      case 'RESET': {
        return createInitialState(experiencePricePerPerson, depositPercent, roomModes);
      }

      default:
        return state;
    }
  };
}

export function ExperienceReservationProvider({
  children,
  config,
  roomModes,
}: ExperienceReservationProviderProps) {
  const [state, dispatch] = useReducer(
    createReservationReducer(
      config.experiencePricePerPerson,
      config.depositPercent,
      roomModes
    ),
    createInitialState(config.experiencePricePerPerson, config.depositPercent, roomModes)
  );

  const storage = useMemo(
    () => createReservationStorage(config.id),
    [config.id]
  );

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = storage.loadFromStorage();
    if (saved) {
      dispatch({ type: 'HYDRATE', payload: saved });
    } else {
      dispatch({
        type: 'HYDRATE',
        payload: { isHydrated: true },
      });
    }
  }, [storage]);

  // Save to localStorage on state change (after hydration)
  useEffect(() => {
    if (state.isHydrated) {
      storage.saveToStorage(state);
    }
  }, [state, storage]);

  return (
    <ExperienceReservationContext.Provider value={{ state, dispatch, roomModes }}>
      {children}
    </ExperienceReservationContext.Provider>
  );
}
