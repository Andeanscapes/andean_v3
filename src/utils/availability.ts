/**
 * Availability helpers.
 *
 * Mock and remote experience data carry a fixed list of departures, so it goes
 * stale as dates pass. Every data path filters through here before render so an
 * expired departure is never advertised.
 */

import type { AvailableDate } from '@/lib/schemas';

function dateInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

/**
 * Keep only departures that are today-or-later in the operating timezone,
 * flagged available, and still have spots.
 */
export function filterCurrentAvailableDates(
  dates: AvailableDate[],
  timeZone = 'America/Bogota',
  now = new Date(),
): AvailableDate[] {
  const today = dateInTimeZone(now, timeZone);
  return dates.filter(
    (date) =>
      date.startDate.slice(0, 10) >= today &&
      date.isAvailable &&
      date.spots > 0,
  );
}
