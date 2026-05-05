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
  AccommodationTiersContent,
  AvailableDate,
  RoundtripTransferConfig,
} from '@/lib/schemas';
import { calculatePricing, computePeopleCount, suggestRoomSelections, type BookingSelections } from '@/utils/helpers';
import { createReservationStorage } from '@/utils/reservationStorage';

export const ExperienceReservationContext =
  createContext<ReservationContextValue | null>(null);

interface ExperienceReservationProviderProps {
  children: ReactNode;
  config: ExperienceConfig;
  roomModes: RoomModeOption[];
  accommodationTiersContent?: AccommodationTiersContent;
  availableDates?: AvailableDate[];
  initialSelections?: BookingSelections;
}

function createInitialState(
  experiencePricePerPerson: number,
  depositPercent: number,
  roomModes: RoomModeOption[],
  initialSelections?: BookingSelections | null,
  tiersContent?: AccommodationTiersContent | null,
): ReservationState {
  // Synchronously apply URL-param selections so the first render already has
  // the correct tier/date/transport — this moves LCP image discovery to the
  // initial render instead of after the HYDRATE useEffect fires.
  const tierId = getValidTierId(initialSelections?.tier ?? null, tiersContent ?? null);
  const transportMode = (initialSelections?.transport ?? null) as ReservationState['transportMode'];
  const dateId = initialSelections?.date ?? null;

  let roomSelections: RoomSelection[] = [];
  if (initialSelections?.people && initialSelections.people > 0) {
    roomSelections = suggestRoomSelections(initialSelections.people, roomModes, tierId);
  }
  const peopleCount = computePeopleCount(roomSelections, roomModes);
  // getRoundtripConfig is a function declaration below — safe to call before its
  // textual position because function declarations are hoisted.
  const roundtripConfig = getRoundtripConfig(tierId, tiersContent ?? null);

  return {
    selectedTierId: tierId,
    selectedDateId: dateId,
    selectedDateLabel: null,
    availableSpots: null,
    peopleCount,
    roomSelections,
    transportMode,
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
      roomSelections,
      transportMode,
      roundtripConfig,
    ),
    isHydrated: false,
    isRoomSuggested: roomSelections.length > 0,
  };
}

function getValidTierId(
  tierId: string | null | undefined,
  tiersContent: AccommodationTiersContent | null,
): string | null {
  if (!tierId || !tiersContent) return null;
  return tiersContent.tiers.some((tier) => tier.id === tierId) ? tierId : null;
}

function filterRoomSelectionsForTier(
  selections: RoomSelection[],
  roomModes: RoomModeOption[],
  tierId: string | null,
): RoomSelection[] {
  const validRoomModes = new Set(
    roomModes
      .filter((mode) => !tierId || !mode.tier_id || mode.tier_id === tierId)
      .map((mode) => mode.value),
  );

  return selections.filter((selection) => validRoomModes.has(selection.roomMode));
}

function getRoundtripConfig(
  tierId: string | null,
  tiersContent: AccommodationTiersContent | null,
): RoundtripTransferConfig | null {
  if (!tierId || !tiersContent) return null;
  return tiersContent.tiers.find((t) => t.id === tierId)?.roundtripTransfer ?? null;
}

function createReservationReducer(
  experiencePricePerPerson: number,
  depositPercent: number,
  roomModes: RoomModeOption[],
  tiersContent: AccommodationTiersContent | null,
) {
  return function reservationReducer(
    state: ReservationState,
    action: ReservationAction
  ): ReservationState {
    switch (action.type) {
      case 'SET_TIER': {
        const emptySelections: RoomSelection[] = [];
        return {
          ...state,
          selectedTierId: action.payload,
          roomSelections: emptySelections,
          isRoomSuggested: false,
          peopleCount: 0,
          pricing: calculatePricing(
            experiencePricePerPerson,
            depositPercent,
            roomModes,
            emptySelections,
            state.transportMode,
            getRoundtripConfig(action.payload, tiersContent),
          ),
        };
      }

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
          isRoomSuggested: false,
          peopleCount,
          pricing: calculatePricing(
            experiencePricePerPerson,
            depositPercent,
            roomModes,
            action.payload,
            state.transportMode,
            getRoundtripConfig(state.selectedTierId, tiersContent),
          ),
        };
      }

      case 'SET_PEOPLE': {
        const suggested = suggestRoomSelections(action.payload, roomModes, state.selectedTierId);
        const newPeopleCount = computePeopleCount(suggested, roomModes);
        return {
          ...state,
          roomSelections: suggested,
          isRoomSuggested: true,
          peopleCount: newPeopleCount,
          pricing: calculatePricing(
            experiencePricePerPerson,
            depositPercent,
            roomModes,
            suggested,
            state.transportMode,
            getRoundtripConfig(state.selectedTierId, tiersContent),
          ),
        };
      }

      case 'SET_TRANSPORT': {
        return {
          ...state,
          transportMode: action.payload,
          pricing: calculatePricing(
            experiencePricePerPerson,
            depositPercent,
            roomModes,
            state.roomSelections,
            action.payload,
            getRoundtripConfig(state.selectedTierId, tiersContent),
          ),
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
        const validTierId = getValidTierId(payload.selectedTierId ?? state.selectedTierId, tiersContent);
        const rawRoomSelections = Array.isArray(payload.roomSelections)
          ? payload.roomSelections
          : payload.roomMode
            ? [{ roomMode: payload.roomMode, quantity: 1 }]
            : state.roomSelections;
        const roomSelections = filterRoomSelectionsForTier(rawRoomSelections, roomModes, validTierId);
        const hydrated: ReservationState = {
          ...state,
          ...payload,
          selectedTierId: validTierId,
          roomSelections,
          peopleCount: computePeopleCount(roomSelections, roomModes),
          isHydrated: true,
        };
        // Recalculate pricing based on hydrated values
        hydrated.pricing = calculatePricing(
          experiencePricePerPerson,
          depositPercent,
          roomModes,
          hydrated.roomSelections,
          hydrated.transportMode,
          getRoundtripConfig(hydrated.selectedTierId, tiersContent),
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
  accommodationTiersContent,
  availableDates = [],
  initialSelections,
}: ExperienceReservationProviderProps) {
  const [state, dispatch] = useReducer(
    createReservationReducer(
      config.experiencePricePerPerson,
      config.depositPercent,
      roomModes,
      accommodationTiersContent ?? null,
    ),
    createInitialState(
      config.experiencePricePerPerson,
      config.depositPercent,
      roomModes,
      initialSelections,
      accommodationTiersContent,
    )
  );

  const storage = useMemo(
    () => createReservationStorage(config.id),
    [config.id]
  );

  // Hydrate from localStorage on mount, merging query params
  useEffect(() => {
    const saved = storage.loadFromStorage();

    const merged: Partial<ReservationState> = { ...(saved ?? {}) };

    // Query-string selections take highest priority (shared / deep-linked URL)
    if (initialSelections) {
      if (initialSelections.tier) merged.selectedTierId = initialSelections.tier;
      if (initialSelections.date) merged.selectedDateId = initialSelections.date;
      if (initialSelections.transport) merged.transportMode = initialSelections.transport;
    }

    // Resolve date metadata (spots) from available dates when only id is known
    if (merged.selectedDateId && merged.availableSpots == null) {
      const matchedDate = availableDates.find((d) => d.id === merged.selectedDateId);
      if (matchedDate) {
        merged.availableSpots = matchedDate.spots;
      }
    }

    // Suggest best-fit room selections when people count comes from the URL.
    // This fires whenever the booking page is opened via a CTA from the detail page
    // or when the shared link includes ?people=N. It overrides any saved selections
    // so the booking page always starts pre-filled with a sensible room config.
    if (initialSelections?.people && initialSelections.people > 0) {
      const tierId = (merged.selectedTierId ?? null) as string | null;
      let suggested = suggestRoomSelections(initialSelections.people, roomModes, tierId);

      // If the tier has no eligible rooms (unknown tier id, all units gone, etc.),
      // fall back to searching across all room modes — same as if no tier was given.
      if (suggested.length === 0 && tierId !== null) {
        suggested = suggestRoomSelections(initialSelections.people, roomModes, null);
      }

      // Always apply: empty result means fresh start (no rooms pre-selected),
      // which is correct — don't leave stale localStorage data behind.
      merged.roomSelections = suggested;
      if (suggested.length > 0) merged.isRoomSuggested = true;
    }

    if (Object.keys(merged).length > 0) {
      dispatch({ type: 'HYDRATE', payload: merged });
    } else {
      dispatch({
        type: 'HYDRATE',
        payload: { isHydrated: true },
      });
    }
  }, [storage, initialSelections, availableDates]);

  // Keep URL query params in sync with booking selections so the link is always shareable
  useEffect(() => {
    if (!state.isHydrated || typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    const params = url.searchParams;

    if (state.selectedTierId) params.set('tier', state.selectedTierId);
    else params.delete('tier');

    if (state.selectedDateId) params.set('date', state.selectedDateId);
    else params.delete('date');

    if (state.transportMode) params.set('transport', state.transportMode);
    else params.delete('transport');

    if (state.peopleCount > 0) params.set('people', String(state.peopleCount));
    else params.delete('people');

    const qs = params.toString();
    const newUrl = qs ? `${url.pathname}?${qs}` : url.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [state.isHydrated, state.selectedTierId, state.selectedDateId, state.transportMode, state.peopleCount]);

  // Save to localStorage on state change (after hydration)
  useEffect(() => {
    if (state.isHydrated) {
      storage.saveToStorage(state);
    }
  }, [state, storage]);

  const contextValue = useMemo<ReservationContextValue>(
    () => ({
      state,
      dispatch,
      roomModes,
      accommodationTiersContent: accommodationTiersContent ?? null,
      availableDates,
    }),
    [state, dispatch, roomModes, accommodationTiersContent, availableDates]
  );

  return (
    <ExperienceReservationContext.Provider value={contextValue}>
      {children}
    </ExperienceReservationContext.Provider>
  );
}
