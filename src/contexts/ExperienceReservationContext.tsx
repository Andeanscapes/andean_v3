'use client';

import { useReducer, useEffect, useMemo, type ReactNode } from 'react';
import { createContext } from 'use-context-selector';
import type {
  ReservationState,
  ReservationAction,
  ReservationContextValue,
  ExperienceConfig,
  RoomModeOption,
} from '@/lib/experiences/types';
import { calculatePricing } from '@/lib/experiences/config';
import { createReservationStorage } from '@/lib/experiences/reservationStorage';

export const ExperienceReservationContext =
  createContext<ReservationContextValue | null>(null);

interface ExperienceReservationProviderProps {
  children: ReactNode;
  config: ExperienceConfig;
  roomModes: RoomModeOption[];
}

function createInitialState(
  basePricePerPerson: number,
  depositPercent: number,
  roomModes: RoomModeOption[]
): ReservationState {
  return {
    selectedDateId: null,
    selectedDateLabel: null,
    availableSpots: null,
    peopleCount: 2,
    roomMode: 'private',
    transportMode: null,
    contact: {
      name: '',
      phone: '',
      email: '',
    },
    termsAccepted: false,
    pricing: calculatePricing(
      basePricePerPerson,
      2,
      depositPercent,
      roomModes,
      'private'
    ),
    isHydrated: false,
  };
}

function createReservationReducer(
  basePricePerPerson: number,
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

      case 'SET_PEOPLE_COUNT': {
        const newCount = Math.max(1, Math.min(10, action.payload));
        return {
          ...state,
          peopleCount: newCount,
          pricing: calculatePricing(
            basePricePerPerson,
            newCount,
            depositPercent,
            roomModes,
            state.roomMode
          ),
        };
      }

      case 'SET_ROOM_MODE': {
        return {
          ...state,
          roomMode: action.payload,
          pricing: calculatePricing(
            basePricePerPerson,
            state.peopleCount,
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
        const hydrated = { ...state, ...action.payload, isHydrated: true };
        // Recalculate pricing based on hydrated values
        hydrated.pricing = calculatePricing(
          basePricePerPerson,
          hydrated.peopleCount,
          depositPercent,
          roomModes,
          hydrated.roomMode
        );
        return hydrated;
      }

      case 'RESET': {
        return createInitialState(basePricePerPerson, depositPercent, roomModes);
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
      config.basePricePerPerson,
      config.depositPercent,
      roomModes
    ),
    createInitialState(config.basePricePerPerson, config.depositPercent, roomModes)
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
    <ExperienceReservationContext.Provider value={{ state, dispatch }}>
      {children}
    </ExperienceReservationContext.Provider>
  );
}
