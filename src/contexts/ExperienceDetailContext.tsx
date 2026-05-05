'use client';

import { useReducer, useEffect, useMemo, type ReactNode } from 'react';
import { createContext } from 'use-context-selector';
import type { ExperienceData, TransportMode } from '@/lib/schemas';
import { createDetailSelectionStorage } from '@/utils/reservationStorage';

// ---- State ----

export interface ExperienceDetailState {
  selectedTierId: string | null;
  selectedDateId: string | null;
  peopleCount: number;
  transportMode: TransportMode | null;
  roundtripTransferRequested: boolean;
  isHydrated: boolean;
}

// ---- Actions ----

export type ExperienceDetailAction =
  | { type: 'SET_TIER'; payload: string }
  | { type: 'SET_DATE'; payload: string }
  | { type: 'SET_PEOPLE'; payload: number }
  | { type: 'SET_TRANSPORT'; payload: TransportMode }
  | { type: 'SET_ROUNDTRIP_TRANSFER'; payload: boolean }
  | { type: 'HYDRATE'; payload: Partial<ExperienceDetailState> }
  | { type: 'RESET' };

// ---- Context value ----

export interface ExperienceDetailContextValue {
  state: ExperienceDetailState;
  dispatch: (action: ExperienceDetailAction) => void;
  experienceData: ExperienceData;
}

export const ExperienceDetailContext =
  createContext<ExperienceDetailContextValue | null>(null);

// ---- Reducer ----

function getDefaultTierId(experienceData: ExperienceData): string | null {
  const tiers = experienceData.accommodationTiersContent?.tiers ?? experienceData.accommodationTiers;
  const defaultTier = tiers?.find((t) => t.isHostChoice) ?? tiers?.[0];
  return defaultTier?.id ?? null;
}

function createInitialState(experienceData: ExperienceData): ExperienceDetailState {
  const tiers = experienceData.accommodationTiersContent?.tiers ?? experienceData.accommodationTiers;
  const defaultTier = tiers?.find((t) => t.isHostChoice) ?? tiers?.[0];

  const defaultTransport = (experienceData.transportOptions?.[0]?.value ?? null) as TransportMode | null;

  return {
    selectedTierId: defaultTier?.id ?? null,
    selectedDateId: null,
    peopleCount: experienceData.config.minPeople,
    transportMode: defaultTransport,
    roundtripTransferRequested: false,
    isHydrated: false,
  };
}

function getValidTierId(
  tierId: string | null | undefined,
  experienceData: ExperienceData,
): string | null {
  const tiers = experienceData.accommodationTiersContent?.tiers ?? experienceData.accommodationTiers;
  if (!tierId || !tiers) return null;
  return tiers.some((tier) => tier.id === tierId) ? tierId : null;
}

function detailReducer(
  state: ExperienceDetailState,
  action: ExperienceDetailAction,
): ExperienceDetailState {
  switch (action.type) {
    case 'SET_TIER':
      return { ...state, selectedTierId: action.payload };
    case 'SET_DATE':
      return { ...state, selectedDateId: action.payload };
    case 'SET_PEOPLE':
      return { ...state, peopleCount: action.payload };
    case 'SET_TRANSPORT':
      return { ...state, transportMode: action.payload };
    case 'SET_ROUNDTRIP_TRANSFER':
      return { ...state, roundtripTransferRequested: action.payload };
    case 'HYDRATE':
      return { ...state, ...action.payload, isHydrated: true };
    case 'RESET':
      return { ...state, selectedTierId: null, selectedDateId: null, peopleCount: 1, transportMode: null, roundtripTransferRequested: false };
    default:
      return state;
  }
}

// ---- Provider ----

interface ExperienceDetailProviderProps {
  children: ReactNode;
  experienceData: ExperienceData;
}

export function ExperienceDetailProvider({
  children,
  experienceData,
}: ExperienceDetailProviderProps) {
  const initialState = useMemo(
    () => createInitialState(experienceData),
    [experienceData],
  );

  const [state, dispatch] = useReducer(detailReducer, initialState);

  const storage = useMemo(
    () => createDetailSelectionStorage(experienceData.config.id),
    [experienceData.config.id],
  );

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = storage.loadFromStorage();
    if (saved) {
      const validTierId = getValidTierId(saved.selectedTierId, experienceData);
      dispatch({
        type: 'HYDRATE',
        payload: {
          ...saved,
          selectedTierId: validTierId ?? getDefaultTierId(experienceData),
        },
      });
    } else {
      dispatch({ type: 'HYDRATE', payload: {} });
    }
  }, [experienceData, storage]);

  // Persist to localStorage after hydration
  useEffect(() => {
    if (!state.isHydrated) return;
    storage.saveToStorage(state);
  }, [state, storage]);

  const value = useMemo<ExperienceDetailContextValue>(
    () => ({ state, dispatch, experienceData }),
    [state, experienceData],
  );

  return (
    <ExperienceDetailContext.Provider value={value}>
      {children}
    </ExperienceDetailContext.Provider>
  );
}
