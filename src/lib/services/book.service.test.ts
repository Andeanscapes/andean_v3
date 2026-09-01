/**
 * Regression tests for fetchRawExperienceData.
 *
 * The remote feed is the only data source — there is no local fallback — so
 * these guard:
 *  1. Expired availability leaking through from the feed.
 *  2. An unavailable feed failing loudly instead of resolving to nothing, which
 *     previously let the experiences list render "From $0".
 *  3. The page reaching out to the WhatsApp bot feed at request time — a
 *     separate service's concern that must not be coupled to this page.
 *
 * Payloads come from a snapshot of the live feed (src/test/fixtures) so the
 * suite stays deterministic and offline.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => (key: string) => key),
}));

import { fetchRawExperienceData } from './book.service';
import {
  EXPERIENCE_EMERALD_MINING_FIXTURE,
  cloneFixture,
} from '@/test/fixtures';

// v2's AvailableDateSchema is strict and carries no `endDate` — duration comes
// from `experience.duration`, so a departure is a start date plus spots.
const PAST_DATE = {
  id: 'past-2020',
  startDate: '2020-01-01T00:00:00.000Z',
  spots: 5,
  isAvailable: true,
};

function feedPayload() {
  return cloneFixture(EXPERIENCE_EMERALD_MINING_FIXTURE);
}

function feedPayloadWithExpiredDate() {
  const base = feedPayload();
  return { ...base, availableDates: [PAST_DATE, ...base.availableDates] };
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

describe('fetchRawExperienceData', () => {
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

    const data = await fetchRawExperienceData('emeraldMining');

    expect(data.availableDates.some((d) => d.id === 'past-2020')).toBe(false);
    expect(data.availableDates.length).toBeGreaterThan(0);
    expect(data.availableDates.every((d) => d.startDate.slice(0, 10) >= FROZEN_TODAY)).toBe(true);
  });

  it('empties availability once the whole calendar is in the past', async () => {
    // Also proves the frozen clock is actually driving the filter.
    vi.setSystemTime(new Date('2099-01-01T00:00:00.000Z'));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse(feedPayload())));

    const data = await fetchRawExperienceData('emeraldMining');

    expect(data.availableDates).toEqual([]);
  });

  it('requests the kebab-cased feed path for a camelCase id', async () => {
    const mockFetch = vi.fn().mockResolvedValue(okResponse(feedPayload()));
    vi.stubGlobal('fetch', mockFetch);

    await fetchRawExperienceData('emeraldMining');

    expect(String(mockFetch.mock.calls[0][0])).toBe(
      'https://cdn.example.com/services/experience-emerald-mining.json',
    );
  });

  it('throws when the feed is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));

    await expect(fetchRawExperienceData('emeraldMining')).rejects.toThrow(
      /Experience feed unavailable/,
    );
  });

  it('throws when the feed returns a payload that fails the schema', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse({ nope: true })));

    await expect(fetchRawExperienceData('emeraldMining')).rejects.toThrow(
      /Experience feed unavailable/,
    );
  });

  it('serves any experience the feed publishes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse(feedPayload())));

    const data = await fetchRawExperienceData('brandNewExperience');

    expect(data.experience.pricing.basePerPerson).toBe(
      EXPERIENCE_EMERALD_MINING_FIXTURE.experience.pricing.basePerPerson,
    );
  });

  it('exposes optional addons without letting them affect plan pricing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse(feedPayload())));

    const data = await fetchRawExperienceData('emeraldMining');
    const addonIds = data.addons.map((a) => a.id);

    expect(addonIds).toEqual(['apiary_cattle', 'horseback_riding']);

    // The projected `fromPrice` sums tier services — addons must never be
    // modelled there, or the list "From" price would silently include extras.
    for (const tier of data.accommodationTiers) {
      expect(tier.services).toEqual([]);
    }

    // Base rate stays the plan rate, not plan + extras.
    expect(data.experience.pricing.basePerPerson).toBe(500000);
  });

  it('never reaches out to the WhatsApp bot feed', async () => {
    const mockFetch = vi.fn().mockResolvedValue(okResponse(feedPayload()));
    vi.stubGlobal('fetch', mockFetch);

    await fetchRawExperienceData('emeraldMining');

    const requestedUrls = mockFetch.mock.calls.map(([url]) => String(url));
    expect(requestedUrls).toHaveLength(1);
    expect(requestedUrls[0]).not.toMatch(/whatsapp_bot|bot-dynamic/);
  });
});
