/**
 * Guards the timezone pinning in the date formatters.
 *
 * Written after a hydration mismatch on `/fr`: the Node server rendered
 * "25 septembre" and the browser "26 septembre" for the same departure. The
 * formatters omitted `timeZone`, so output followed each runtime's default zone.
 *
 * Two defects, one cause. Besides the mismatch, any zone behind UTC advertised
 * the departure a day early — the feed publishes `2026-09-26T00:00:00.000Z`, and
 * `America/Bogota` (UTC-5) renders that as 25 September.
 */

import { describe, it, expect } from 'vitest';
import { formatDayMonth, formatDateRange } from './dateFormatters';

/** A real departure from the feed: UTC midnight, the boundary that breaks. */
const DEPARTURE = '2026-09-26T00:00:00.000Z';

describe('formatDayMonth', () => {
  it('renders the published calendar date, not a zone-shifted one', () => {
    expect(formatDayMonth(DEPARTURE, 'fr')).toBe('26 septembre');
    expect(formatDayMonth(DEPARTURE, 'en')).toBe('September 26');
  });

  it('is identical across runtime timezones', () => {
    // Stands in for server-vs-browser: the value must not depend on the zone the
    // process happens to run in.
    const zones = ['UTC', 'America/Bogota', 'Europe/Madrid', 'Asia/Tokyo', 'Pacific/Kiritimati'];
    const rendered = new Set<string>();

    for (const timeZone of zones) {
      const original = process.env.TZ;
      process.env.TZ = timeZone;
      try {
        rendered.add(formatDayMonth(DEPARTURE, 'fr'));
      } finally {
        process.env.TZ = original;
      }
    }

    expect(rendered.size, `varied by timezone: ${Array.from(rendered).join(' | ')}`).toBe(1);
  });

  it('accepts a date-only string, which the landing projection passes', () => {
    // `nextAvailability.dateISO` is `startDate.slice(0, 10)`.
    expect(formatDayMonth('2026-09-26', 'fr')).toBe(formatDayMonth(DEPARTURE, 'fr'));
  });

  it('degrades to TBD on an unparseable value rather than "Invalid Date"', () => {
    expect(formatDayMonth('not-a-date', 'en')).toBe('TBD');
  });
});

describe('formatDateRange', () => {
  it('stays pinned to UTC as well', () => {
    // Same hazard, already handled — asserted so it cannot regress.
    expect(formatDateRange(DEPARTURE, undefined, 'en')).toContain('26');
  });
});
