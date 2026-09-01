/**
 * Regression tests for getLandingDataSSR.
 *
 * The remote feed is the only data source — there is no local fallback. Guards
 * expired departures leaking through from the feed, and the matching bug where
 * `nextAvailability` was not re-derived from the survivors.
 *
 * Payloads come from a snapshot of the live feed (src/test/fixtures) so the
 * suite stays deterministic and offline.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => (key: string) => key),
}));

import { getLandingDataSSR } from './landing.service';
import { LANDING_FIXTURE, cloneFixture } from '@/test/fixtures';

// v2's AvailableDateSchema is strict and carries no `endDate`.
const PAST_DATE = {
  id: 'past-2020',
  startDate: '2020-01-01T00:00:00.000Z',
  spots: 4,
  isAvailable: true,
};

function feedPayload() {
  return cloneFixture(LANDING_FIXTURE);
}

/**
 * v2 owns availability per experience, and `nextAvailability` no longer exists
 * in the payload at all — the service derives it. Prepending an expired
 * departure is enough to prove both the filter and the re-derivation.
 */
function feedPayloadWithExpiredDate() {
  const base = feedPayload();

  return {
    ...base,
    experiences: base.experiences.map((entry) => ({
      ...entry,
      availableDates: [PAST_DATE, ...entry.availableDates],
    })),
  };
}

function okResponse(payload: unknown) {
  return { ok: true, json: async () => payload };
}

/**
 * Availability filtering is clock-dependent, so the clock is frozen. Without
 * this the suite would start failing on its own once the calendar expires.
 * Only `Date` is faked — timers stay real so the fetch abort timeout still works.
 */
const FROZEN_NOW = new Date('2026-09-01T12:00:00.000Z');
const FROZEN_TODAY = '2026-09-01';

describe('getLandingDataSSR', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(FROZEN_NOW);
    process.env.REMOTE_DATA_BASE_URL = 'https://cdn.example.com/services';
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    delete process.env.REMOTE_DATA_BASE_URL;
  });

  it('drops expired dates from the feed payload', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse(feedPayloadWithExpiredDate())));

    const content = await getLandingDataSSR('en');

    expect(content.flagship.availableDates.some((d) => d.id === 'past-2020')).toBe(false);
    expect(content.flagship.availableDates.length).toBeGreaterThan(0);
    expect(
      content.flagship.availableDates.every((d) => d.startDate.slice(0, 10) >= FROZEN_TODAY),
    ).toBe(true);
  });

  it('re-derives nextAvailability from the surviving dates', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse(feedPayloadWithExpiredDate())));

    const content = await getLandingDataSSR('en');
    const firstDate = content.flagship.availableDates[0];

    for (const item of content.featuredExperiences.items) {
      // Never the stale 2020 value the payload carried.
      expect(item.nextAvailability?.dateISO).not.toBe('2020-01-01');
      expect(item.nextAvailability?.dateISO).toBe(firstDate.startDate.slice(0, 10));
      expect(item.nextAvailability?.spotsLeft).toBe(firstDate.spots);
    }
  });

  it('throws when the feed is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));

    await expect(getLandingDataSSR('en')).rejects.toThrow(/Landing feed unavailable/);
  });

  it('throws when the feed returns a payload that fails the schema', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse({ nope: true })));

    await expect(getLandingDataSSR('en')).rejects.toThrow(/Landing feed unavailable/);
  });

  it('requests the landing feed path', async () => {
    const mockFetch = vi.fn().mockResolvedValue(okResponse(feedPayload()));
    vi.stubGlobal('fetch', mockFetch);

    await getLandingDataSSR('en');

    expect(String(mockFetch.mock.calls[0][0])).toBe(
      'https://cdn.example.com/services/landing.json',
    );
  });

  it('never reaches out to the WhatsApp bot feed', async () => {
    const mockFetch = vi.fn().mockResolvedValue(okResponse(feedPayload()));
    vi.stubGlobal('fetch', mockFetch);

    await getLandingDataSSR('en');

    const requestedUrls = mockFetch.mock.calls.map(([url]) => String(url));
    expect(requestedUrls).toHaveLength(1);
    expect(requestedUrls[0]).not.toMatch(/whatsapp_bot|bot-dynamic/);
  });
});
