import type { AvailableDate } from './types';

/**
 * Formats a date range for display based on user's locale
 * 
 * @param startDate - ISO 8601 UTC string
 * @param endDate - ISO 8601 UTC string
 * @param locale - User's locale (e.g., 'es', 'en', 'fr')
 * @returns Formatted date range string
 * 
 * Examples:
 * - es: "Sáb 16 - Dom 17 Mar"
 * - en: "Sat 16 - Sun 17 Mar"
 * - fr: "Sam 16 - Dim 17 Mar"
 */
export function formatDateRange(
  startDate: string,
  endDate: string,
  locale: string
): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

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
  const endWeekday = weekdayFormatter.format(end);
  const endDay = dayFormatter.format(end);
  const month = monthFormatter.format(start);

  return `${startWeekday} ${startDay} - ${endWeekday} ${endDay} ${month}`;
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
