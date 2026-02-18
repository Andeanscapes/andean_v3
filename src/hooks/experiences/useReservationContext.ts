'use client';

import { useContextSelector } from 'use-context-selector';
import { ExperienceReservationContext } from '@/contexts/ExperienceReservationContext';
import type {
  RoomMode,
  TransportMode,
  ReservationContextValue,
} from '@/lib/experiences/types';

const requireContext = (
  context: ReservationContextValue | null
): ReservationContextValue => {
  if (!context) {
    throw new Error(
      'useReservationContext must be used within ExperienceReservationProvider'
    );
  }
  return context;
};

export function useReservationDate() {
  return useContextSelector(ExperienceReservationContext, (ctx) => {
    const safe = requireContext(ctx);
    return {
      selectedDateId: safe.state.selectedDateId,
      selectedDateLabel: safe.state.selectedDateLabel,
      availableSpots: safe.state.availableSpots,
      setDate: (id: string, label: string, spots: number) =>
        safe.dispatch({ type: 'SET_DATE', payload: { id, label, spots } }),
    };
  }) as {
    selectedDateId: string | null;
    selectedDateLabel: string | null;
    availableSpots: number | null;
    setDate: (id: string, label: string, spots: number) => void;
  };
}

export function usePeopleAndMode() {
  return useContextSelector(ExperienceReservationContext, (ctx) => {
    const safe = requireContext(ctx);
    return {
      peopleCount: safe.state.peopleCount,
      roomMode: safe.state.roomMode,
      setPeopleCount: (count: number) =>
        safe.dispatch({ type: 'SET_PEOPLE_COUNT', payload: count }),
      setRoomMode: (mode: RoomMode) =>
        safe.dispatch({ type: 'SET_ROOM_MODE', payload: mode }),
    };
  }) as {
    peopleCount: number;
    roomMode: RoomMode;
    setPeopleCount: (count: number) => void;
    setRoomMode: (mode: RoomMode) => void;
  };
}

export function useReservationTransport() {
  return useContextSelector(ExperienceReservationContext, (ctx) => {
    const safe = requireContext(ctx);
    return {
      transportMode: safe.state.transportMode,
      setTransportMode: (mode: TransportMode) =>
        safe.dispatch({ type: 'SET_TRANSPORT', payload: mode }),
    };
  }) as {
    transportMode: TransportMode | null;
    setTransportMode: (mode: TransportMode) => void;
  };
}

export function useReservationContact() {
  return useContextSelector(ExperienceReservationContext, (ctx) => {
    const safe = requireContext(ctx);
    return {
      contact: safe.state.contact,
      setContactField: (
        field: 'name' | 'phone' | 'email',
        value: string
      ) =>
        safe.dispatch({
          type: 'SET_CONTACT',
          payload: { field, value },
        }),
    };
  }) as {
    contact: { name: string; phone: string; email: string };
    setContactField: (
      field: 'name' | 'phone' | 'email',
      value: string
    ) => void;
  };
}

export function useReservationTerms() {
  return useContextSelector(ExperienceReservationContext, (ctx) => {
    const safe = requireContext(ctx);
    return {
      termsAccepted: safe.state.termsAccepted,
      setTermsAccepted: (accepted: boolean) =>
        safe.dispatch({ type: 'SET_TERMS', payload: accepted }),
    };
  }) as {
    termsAccepted: boolean;
    setTermsAccepted: (accepted: boolean) => void;
  };
}

export function useReservationPricing() {
  return useContextSelector(ExperienceReservationContext, (ctx) => {
    const safe = requireContext(ctx);
    return safe.state.pricing;
  }) as {
    basePricePerPerson: number;
    total: number;
    depositPercent: number;
    depositAmount: number;
  };
}

export function useReservationState() {
  return useContextSelector(ExperienceReservationContext, (ctx) => {
    const safe = requireContext(ctx);
    return safe.state;
  });
}

export function useReservationDispatch() {
  return useContextSelector(ExperienceReservationContext, (ctx) => {
    const safe = requireContext(ctx);
    return safe.dispatch;
  });
}

export function useReservationValidation() {
  return useContextSelector(ExperienceReservationContext, (ctx) => {
    const safe = requireContext(ctx);
    return {
      isValid:
        safe.state.selectedDateId !== null &&
        safe.state.peopleCount >= 1 &&
        safe.state.transportMode !== null &&
        safe.state.contact.name.length >= 2 &&
        safe.state.contact.phone.length >= 7 &&
        safe.state.termsAccepted === true,
      state: safe.state,
      dispatch: safe.dispatch,
      setTermsAccepted: (value: boolean) =>
        safe.dispatch({ type: 'SET_TERMS', payload: value }),
    };
  }) as {
    isValid: boolean;
    state: import('@/lib/experiences/types').ReservationState;
    dispatch: (action: import('@/lib/experiences/types').ReservationAction) => void;
    setTermsAccepted: (value: boolean) => void;
  };
}
