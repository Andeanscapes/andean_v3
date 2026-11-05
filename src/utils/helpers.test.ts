import { describe, expect, it } from 'vitest';
import type { AvailableDate } from '@/lib/schemas';
import { parseBookingSearchParams, resolveDayTripSelections, resolveSharedSelections } from './helpers';

const DATES: AvailableDate[] = [
  { id: 'open', startDate: '2026-11-14T00:00:00.000Z', spots: 3, isAvailable: true },
  { id: 'full', startDate: '2026-11-28T00:00:00.000Z', spots: 0, isAvailable: false },
];
const LIMITS = { minPeople: 1, maxPeople: 10 };

describe('parseBookingSearchParams', () => {
  it('accepts only positive whole numbers of people', () => {
    expect(parseBookingSearchParams({ people: '2' }).people).toBe(2);
    expect(parseBookingSearchParams({ people: '2.5' }).people).toBeNull();
    expect(parseBookingSearchParams({ people: '0' }).people).toBeNull();
    expect(parseBookingSearchParams({ people: 'abc' }).people).toBeNull();
  });

  it('ignores unknown transport values', () => {
    expect(parseBookingSearchParams({ transport: 'plane' }).transport).toBeNull();
    expect(parseBookingSearchParams({ transport: 'car_no_4x4' }).transport).toBe('car_no_4x4');
  });
});

describe('resolveSharedSelections', () => {
  it('keeps a bookable date', () => {
    const result = resolveSharedSelections({ date: 'open', people: 2 }, DATES, LIMITS);
    expect(result).toEqual({ selections: { date: 'open', people: 2 }, dateUnavailable: false });
  });

  it.each(['full', 'expired-or-unknown'])('drops the %s date and reports it', (date) => {
    const result = resolveSharedSelections({ date, people: 2 }, DATES, LIMITS);
    expect(result.selections.date).toBeNull();
    expect(result.dateUnavailable).toBe(true);
  });

  it('caps people at the free spots of the shared date', () => {
    expect(resolveSharedSelections({ date: 'open', people: 8 }, DATES, LIMITS).selections.people).toBe(3);
  });

  it('caps people at the tour maximum without a date', () => {
    expect(resolveSharedSelections({ people: 999 }, DATES, LIMITS).selections.people).toBe(10);
  });

  it('raises people to the tour minimum', () => {
    expect(resolveSharedSelections({ people: 1 }, DATES, { minPeople: 2, maxPeople: 10 }).selections.people).toBe(2);
  });

  it('keeps tier and transport untouched and reports nothing without a date', () => {
    const result = resolveSharedSelections({ tier: 'heritage', transport: 'bus' }, DATES, LIMITS);
    expect(result).toEqual({
      selections: { tier: 'heritage', transport: 'bus', date: null, people: null },
      dateUnavailable: false,
    });
  });
});

describe('resolveDayTripSelections', () => {
  const TIERS = [{ id: 'dayVisit' }];

  it('keeps a tier the experience offers', () => {
    expect(resolveDayTripSelections({ tier: 'dayVisit', people: 2 }, TIERS)).toEqual({ tier: 'dayVisit', people: 2 });
  });

  it('falls back to the day-trip tier for an unknown or missing tier', () => {
    expect(resolveDayTripSelections({ tier: 'heritage', people: 2 }, TIERS)).toEqual({ tier: 'dayVisit', people: 2 });
    expect(resolveDayTripSelections(undefined, TIERS)).toEqual({ tier: 'dayVisit' });
  });

  it('leaves the tier empty when the experience has no tiers', () => {
    expect(resolveDayTripSelections({ tier: 'heritage' }, [])).toEqual({ tier: null });
  });
});
