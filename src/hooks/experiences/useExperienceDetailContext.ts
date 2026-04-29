import { useCallback } from 'react';
import { useContextSelector } from 'use-context-selector';
import {
  ExperienceDetailContext,
  type ExperienceDetailContextValue,
} from '@/contexts/ExperienceDetailContext';
import type { TransportMode, AccommodationTierContent } from '@/lib/schemas';

function requireContext<T>(
  value: T | null,
  hookName: string,
): T {
  if (value === null) {
    throw new Error(`${hookName} must be used within ExperienceDetailProvider`);
  }
  return value;
}

function useDetail<T>(selector: (ctx: ExperienceDetailContextValue) => T): T {
  const value = useContextSelector(ExperienceDetailContext, (ctx) => {
    if (ctx === null) return null as unknown as T;
    return selector(ctx);
  });
  return value;
}

// ---- Tier ----

export function useDetailSelectedTier() {
  const selectedTierId = useDetail((ctx) => ctx.state.selectedTierId);
  const dispatch = useDetail((ctx) => ctx.dispatch);

  const setTier = useCallback(
    (tierId: string) => dispatch({ type: 'SET_TIER', payload: tierId }),
    [dispatch],
  );

  return { selectedTierId, setTier };
}

// ---- Tier content (derived) ----

export function useDetailSelectedTierData(): AccommodationTierContent | null {
  return useDetail((ctx) => {
    const { selectedTierId } = ctx.state;
    if (!selectedTierId) return null;
    return (
      ctx.experienceData.accommodationTiersContent?.tiers.find(
        (t) => t.id === selectedTierId,
      ) ?? null
    );
  });
}

// ---- Date ----

export function useDetailSelectedDate() {
  const selectedDateId = useDetail((ctx) => ctx.state.selectedDateId);
  const dispatch = useDetail((ctx) => ctx.dispatch);

  const setDate = useCallback(
    (dateId: string) => dispatch({ type: 'SET_DATE', payload: dateId }),
    [dispatch],
  );

  return { selectedDateId, setDate };
}

// ---- People ----

export function useDetailPeopleCount() {
  const peopleCount = useDetail((ctx) => ctx.state.peopleCount);
  const dispatch = useDetail((ctx) => ctx.dispatch);

  const setPeopleCount = useCallback(
    (count: number) => dispatch({ type: 'SET_PEOPLE', payload: count }),
    [dispatch],
  );

  return { peopleCount, setPeopleCount };
}

// ---- Transport ----

export function useDetailTransport() {
  const transportMode = useDetail((ctx) => ctx.state.transportMode);
  const dispatch = useDetail((ctx) => ctx.dispatch);

  const setTransportMode = useCallback(
    (mode: TransportMode) => dispatch({ type: 'SET_TRANSPORT', payload: mode }),
    [dispatch],
  );

  return { transportMode, setTransportMode };
}

// ---- Roundtrip transfer ----

export function useDetailRoundtripTransfer() {
  const roundtripTransferRequested = useDetail((ctx) => ctx.state.roundtripTransferRequested);
  const dispatch = useDetail((ctx) => ctx.dispatch);

  const setRoundtripTransfer = useCallback(
    (requested: boolean) => dispatch({ type: 'SET_ROUNDTRIP_TRANSFER', payload: requested }),
    [dispatch],
  );

  return { roundtripTransferRequested, setRoundtripTransfer };
}

// ---- Full state (read-only) ----

export function useDetailSelectionState() {
  return useDetail((ctx) => ctx.state);
}

// ---- Experience data (read-only) ----

export function useDetailExperienceData() {
  return useDetail((ctx) => ctx.experienceData);
}

// Re-export requireContext for use in consumer components if needed
export { requireContext };
