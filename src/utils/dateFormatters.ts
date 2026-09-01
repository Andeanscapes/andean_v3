import type { AvailableDate } from '@/lib/schemas';

/**
 * Formats a date range for display based on user's locale
 * 
 * @param startDate - ISO 8601 UTC string
 * @param endDate - Optional ISO 8601 UTC string
 * @param locale - User's locale (e.g., 'es', 'en', 'fr')
 * @returns Formatted date range string
 * 
 * Examples:
 * - es: "Sáb 16 - Dom 17 Mar"
 * - en: "Sat 16 - Sun 17 Mar"
 * - fr: "Sam 16 - Dim 17 Mar"
 * - single day: "Sat 16 Mar"
 */
export function formatDateRange(
  startDate: string,
  endDate: string | undefined,
  locale: string
): string {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  // Fallback label when upstream data is invalid.
  if (Number.isNaN(start.getTime())) {
    return 'TBD';
  }

  const weekdayFormatter = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    timeZone: 'UTC', // Important: keep in UTC, don't convert to local
  });

  const dayFormatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    timeZone: 'UTC',
  });

  const monthFormatter = new Intl.DateTimeFormat(locale, {
    month: 'short',
    timeZone: 'UTC',
  });

  const startWeekday = weekdayFormatter.format(start);
  const startDay = dayFormatter.format(start);
  const month = monthFormatter.format(start);

  if (!end || Number.isNaN(end.getTime())) {
    return `${startWeekday} ${startDay} ${month}`;
  }

  const endWeekday = weekdayFormatter.format(end);
  const endDay = dayFormatter.format(end);

  return `${startWeekday} ${startDay} - ${endWeekday} ${endDay} ${month}`;
}

/**
 * Formats a departure date as day + month, e.g. "26 septembre".
 *
 * Pinned to UTC for the same reason as `formatDateRange`: the feed publishes
 * departures as UTC midnight (`2026-09-26T00:00:00.000Z`), so formatting in the
 * runtime's local zone shifts the calendar date. That produced two defects at
 * once — a hydration mismatch (the Node server and the browser disagreed by a
 * day) and, in any zone behind UTC, a departure advertised one day early.
 *
 * @param startDate ISO 8601 UTC string, or a `YYYY-MM-DD` date-only string.
 * @param locale    User's locale (`en` | `es` | `fr`).
 */
export function formatDayMonth(startDate: string, locale: string): string {
  const date = new Date(startDate);

  if (Number.isNaN(date.getTime())) {
    return 'TBD';
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/**
 * Formats an AvailableDate for display
 * 
 * @param date - AvailableDate object
 * @param locale - User's locale
 * @returns Object with formatted label and metadata
 */
export function formatAvailableDate(date: AvailableDate, locale: string) {
  return {
    id: date.id,
    label: formatDateRange(date.startDate, date.endDate, locale),
    spots: date.spots,
    isAvailable: date.isAvailable,
    startDate: date.startDate,
    endDate: date.endDate,
  };
}

/**
 * Formats all available dates for a given locale
 * 
 * @param dates - Array of AvailableDate objects (UTC)
 * @param locale - User's locale
 * @returns Array of formatted dates
 */
export function formatAvailableDates(dates: AvailableDate[], locale: string) {
  return dates.map((date) => formatAvailableDate(date, locale));
}
