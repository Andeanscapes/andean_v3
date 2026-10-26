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

import { getFlagshipExperiencePathSSR, getLandingDataSSR } from './landing.service';
import { LANDING_FIXTURE, cloneFixture } from '@/test/fixtures';
import { ExperienceIdSchema } from '@/lib/schemas/feed/v2';

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
    vi.restoreAllMocks();
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
    const payload = feedPayloadWithExpiredDate();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse(payload)));

    const content = await getLandingDataSSR('en');

    for (const item of content.featuredExperiences.items) {
      const owner = payload.experiences.find((entry) => entry.slug === item.experienceSlug);
      const firstDate = owner?.availableDates.find((d) => d.startDate.slice(0, 10) >= FROZEN_TODAY);

      // Never the stale 2020 value the payload carried.
      expect(item.nextAvailability?.dateISO).not.toBe('2020-01-01');
      expect(item.nextAvailability?.dateISO).toBe(firstDate?.startDate.slice(0, 10));
      expect(item.nextAvailability?.spotsLeft).toBe(firstDate?.spots);
    }
  });

  it('derives each featured card availability from its own experience', async () => {
    const payload = feedPayload();
    const flagship = payload.experiences.find((entry) => entry.id === payload.flagshipExperienceId);
    if (!flagship) throw new Error('fixture has no flagship entry');

    // The live feed may publish a single experience; add a second, schema-valid
    // one so the assertion does not depend on how many the catalog has today.
    let other = payload.experiences.find((entry) => entry.id !== payload.flagshipExperienceId);
    if (!other) {
      const spareId = ExperienceIdSchema.options.find(
        (id) => !payload.experiences.some((entry) => entry.id === id),
      );
      if (!spareId) throw new Error('no spare experience id to build a second entry');
      other = { ...cloneFixture(flagship), id: spareId, slug: `${flagship.slug}-second` };
      payload.experiences.push(other);
      payload.featuredExperienceIds.push(spareId);
    }

    // The non-flagship experience departs later and with fewer spots.
    const ownDate = { id: 'own-2027', startDate: '2027-03-06T00:00:00.000Z', spots: 2, isAvailable: true };
    other.availableDates = [ownDate];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse(payload)));

    const content = await getLandingDataSSR('en');
    const card = content.featuredExperiences.items.find((item) => item.experienceSlug === other.slug);

    expect(card?.nextAvailability).toEqual({ dateISO: '2027-03-06', spotsLeft: 2 });
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

  it('resolves feed-owned brand media through the CDN', async () => {
    const payload = feedPayload();
    payload.media = {
      hero: '/images/brand/hero.webp',
      finalCta: '/images/brand/final-cta.webp',
      categories: {
        emeraldMining: '/images/brand/emerald.webp',
        nature: '/images/brand/nature.webp',
        rural: '/images/brand/rural.webp',
        horseback: '/images/brand/horseback.webp',
      },
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse(payload)));

    const content = await getLandingDataSSR('en');

    expect(content.heroBrand.backgroundImage).toBe(
      'https://cdn.andeanscapes.com/images/brand/hero.webp',
    );
    expect(content.finalCta.backgroundImage).toBe(
      'https://cdn.andeanscapes.com/images/brand/final-cta.webp',
    );
    expect(content.categories.items.map((item) => item.imageUrl)).toEqual([
      'https://cdn.andeanscapes.com/images/brand/emerald.webp',
      'https://cdn.andeanscapes.com/images/brand/nature.webp',
      'https://cdn.andeanscapes.com/images/brand/rural.webp',
      'https://cdn.andeanscapes.com/images/brand/horseback.webp',
    ]);
  });

  it('selects a resolved hero variant when the feed provides variants', async () => {
    const payload = feedPayload();
    payload.media = {
      hero: '/images/brand/landing-hero.webp',
      heroVariants: [
        '/images/brand/landing-hero-01.webp',
        '/images/brand/landing-hero-02.webp',
      ],
      finalCta: '/images/brand/final-cta.webp',
      categories: {
        emeraldMining: '/images/brand/emerald.webp',
        nature: '/images/brand/nature.webp',
        rural: '/images/brand/rural.webp',
        horseback: '/images/brand/horseback.webp',
      },
    };
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse(payload)));

    const content = await getLandingDataSSR('en');

    expect(content.heroBrand.backgroundImage).toBe(
      'https://cdn.andeanscapes.com/images/brand/landing-hero-02.webp',
    );
  });

  /**
   * Runs against the real RNG: the pick must always land inside the published
   * pool. An off-by-one in the index maths would surface as the `hero` fallback
   * leaking through on a fraction of requests — invisible in a single-call test.
   */
  it('never falls back outside the variant pool across repeated renders', async () => {
    const variants = [
      '/images/brand/landing-hero-01.webp',
      '/images/brand/landing-hero-02.webp',
      '/images/brand/landing-hero-03.webp',
    ];
    const payload = feedPayload();
    payload.media = {
      hero: '/images/brand/landing-hero.webp',
      heroVariants: variants,
      finalCta: '/images/brand/final-cta.webp',
      categories: {
        emeraldMining: '/images/brand/emerald.webp',
        nature: '/images/brand/nature.webp',
        rural: '/images/brand/rural.webp',
        horseback: '/images/brand/horseback.webp',
      },
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse(payload)));

    const allowed = variants.map((path) => `https://cdn.andeanscapes.com${path}`);
    const seen = new Set<string>();

    for (let call = 0; call < 40; call += 1) {
      const content = await getLandingDataSSR('en');
      expect(allowed).toContain(content.heroBrand.backgroundImage);
      seen.add(content.heroBrand.backgroundImage);
    }

    // Sanity check that the pick is actually varying rather than pinned.
    expect(seen.size).toBeGreaterThan(1);
  });

  // The structure fallbacks are `/assets/...`; rewriting them would 404.
  it('leaves source-controlled fallback media on the app origin', async () => {
    const payload = feedPayload();
    delete payload.media;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(okResponse(payload)));

    const content = await getLandingDataSSR('en');

    expect(content.heroBrand.backgroundImage).toMatch(/^\/assets\//);
    expect(content.finalCta.backgroundImage).toMatch(/^\/assets\//);
    expect(content.categories.items.every((item) => item.imageUrl.startsWith('/assets/'))).toBe(
      true,
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

describe('getFlagshipExperiencePathSSR', () => {
  beforeEach(() => {
    process.env.REMOTE_DATA_BASE_URL = 'https://cdn.example.com/services';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.REMOTE_DATA_BASE_URL;
  });

  it('builds the path from the flagship slug, not the first experience', async () => {
    const payload = feedPayload();
    // Put the flagship last so a "first entry" shortcut would fail.
    const flagship = payload.experiences.find((entry) => entry.id === payload.flagshipExperienceId);
    const others = payload.experiences.filter((entry) => entry.id !== payload.flagshipExperienceId);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(okResponse({ ...payload, experiences: [...others, flagship] })),
    );

    await expect(getFlagshipExperiencePathSSR()).resolves.toBe(
      `/experiences/${flagship?.slug}`,
    );
  });

  it('throws when the feed is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));

    await expect(getFlagshipExperiencePathSSR()).rejects.toThrow(/Landing feed unavailable/);
  });
});
