import { describe, it, expect } from 'vitest';
import { filterCurrentAvailableDates } from './availability';

describe('filterCurrentAvailableDates', () => {
  const dates = [
    { id: 'past', startDate: '2026-08-15T00:00:00.000Z', spots: 9, isAvailable: true },
    { id: 'future', startDate: '2026-09-26T00:00:00.000Z', spots: 5, isAvailable: true },
    { id: 'flagged', startDate: '2026-10-10T00:00:00.000Z', spots: 5, isAvailable: false },
    { id: 'empty', startDate: '2026-10-24T00:00:00.000Z', spots: 0, isAvailable: true },
  ];

  it('keeps only future, available, non-empty departures', () => {
    const result = filterCurrentAvailableDates(
      dates,
      'America/Bogota',
      new Date('2026-08-25T15:00:00.000Z'),
    );

    expect(result.map((d) => d.id)).toEqual(['future']);
  });

  it('protects the fallback path from expired dates', () => {
    const result = filterCurrentAvailableDates(
      dates,
      'America/Bogota',
      new Date('2027-01-01T00:00:00.000Z'),
    );

    expect(result).toEqual([]);
  });

  it('keeps a departure through its own day in Bogota time', () => {
    const result = filterCurrentAvailableDates(
      [{ id: 'today', startDate: '2026-09-26T00:00:00.000Z', spots: 5, isAvailable: true }],
      'America/Bogota',
      // 04:00Z on the 27th is still the 26th in Bogota (UTC-5)
      new Date('2026-09-27T04:00:00.000Z'),
    );

    expect(result.map((d) => d.id)).toEqual(['today']);
  });
});
