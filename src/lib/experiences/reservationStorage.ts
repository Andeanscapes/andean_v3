import type { ReservationState } from './types';

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
