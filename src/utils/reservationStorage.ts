import type { ReservationState } from '@/lib/schemas';
import type { ExperienceDetailState } from '@/contexts/ExperienceDetailContext';

export function createReservationStorage(experienceId: string) {
  const STORAGE_KEY = `andeanScapes:${experienceId}Reservation:v1`;

  function saveToStorage(state: ReservationState): void {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { isHydrated, ...toSave } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (err) {
      console.error('[ReservationStorage] Failed to save:', err);
    }
  }

  function loadFromStorage(): Partial<ReservationState> | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);

      // Minimal validation
      if (typeof parsed !== 'object') return null;

      return parsed;
    } catch (err) {
      console.error('[ReservationStorage] Failed to load:', err);
      return null;
    }
  }

  function clearStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('[ReservationStorage] Failed to clear:', err);
    }
  }

  return {
    saveToStorage,
    loadFromStorage,
    clearStorage,
  };
}

export function createDetailSelectionStorage(experienceId: string) {
  const STORAGE_KEY = `andeanScapes:${experienceId}DetailSelection:v1`;

  function saveToStorage(state: ExperienceDetailState): void {
    try {
      const { isHydrated, ...toSave } = state;
      void isHydrated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (err) {
      console.error('[DetailSelectionStorage] Failed to save:', err);
    }
  }

  function loadFromStorage(): Partial<ExperienceDetailState> | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      const parsed: unknown = JSON.parse(stored);
      if (typeof parsed !== 'object' || parsed === null) return null;
      return parsed as Partial<ExperienceDetailState>;
    } catch (err) {
      console.error('[DetailSelectionStorage] Failed to load:', err);
      return null;
    }
  }

  function clearStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('[DetailSelectionStorage] Failed to clear:', err);
    }
  }

  return {
    saveToStorage,
    loadFromStorage,
    clearStorage,
  };
}
