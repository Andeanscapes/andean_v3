/**
 * Regression tests for getExperiencesListSSR against the v2 feed.
 *
 * Two properties matter most here:
 *
 *  1. **Single fetch.** The list used to resolve each card's price by fetching
 *     that experience's own feed file, so one misconfigured card threw out of
 *     the price lookup and took the whole /experiences route down. v2 projects
 *     `card.fromPrice`, so the page renders from one request and that failure
 *     mode is gone. The fetch-count assertion is what keeps the fan-out from
 *     creeping back.
 *  2. **No copy from the feed.** Every user-facing string resolves through
 *     `src/i18n/mappings/*`. `t` is stubbed to echo its key, so any value that
 *     came from the payload instead of a mapping is visible in the output.
 *
 * Payloads come from a snapshot of the live feed (src/test/fixtures) so the
 * suite stays deterministic and offline.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { MockInstance } from 'vitest';
import { EXPERIENCES_LIST_FIXTURE, cloneFixture } from '@/test/fixtures';
import { FEED_MAX_HIGHLIGHTS, HighlightCodeSchema } from '@/lib/schemas/feed/v2';

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => (key: string) => key),
}));

function listFeed(): ReturnType<typeof cloneFixture<typeof EXPERIENCES_LIST_FIXTURE>> {
  return cloneFixture(EXPERIENCES_LIST_FIXTURE);
}

/** Serves only `/experiences-list.json`; anything else 404s. */
function stubFeed(feed: unknown) {
  const mockFetch = vi.fn(async (url: string) => {
    if (String(url).endsWith('/experiences-list.json')) {
      return { ok: true, json: async () => feed };
    }
    return { ok: false, status: 404 };
  });
  vi.stubGlobal('fetch', mockFetch);
  return mockFetch;
}

describe('getExperiencesListSSR', () => {
  let getExperiencesListSSR: typeof import('./experiences-list.service').getExperiencesListSSR;
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(async () => {
    process.env.REMOTE_DATA_BASE_URL = 'https://cdn.example.com/services';
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    ({ getExperiencesListSSR } = await import('./experiences-list.service'));
  });

  afterEach(() => {
    consoleError.mockRestore();
    vi.unstubAllGlobals();
    delete process.env.REMOTE_DATA_BASE_URL;
  });

  it('renders a card from the projected fromPrice without fetching the experience', async () => {
    const feed = listFeed();
    const mockFetch = stubFeed(feed);

    const data = await getExperiencesListSSR('en');
    const published = feed.experiences.filter((entry) => entry.status === 'published');

    expect(data.cards).toHaveLength(published.length);
    expect(data.cards.map((card) => card.price)).toEqual(
      published.map((entry) => entry.card.fromPrice.amount),
    );
    // One request total: the list feed. No per-card fan-out.
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('builds plan and mine badges and the carousel from feed codes', async () => {
    const feed = listFeed();
    const [entry] = feed.experiences;
    entry.planCode = 'prime';
    entry.mineCode = 'chivor';
    entry.card.gallery = ['/images/experiences/x/highlights/highlight-1.webp'];
    stubFeed(feed);

    const [card] = (await getExperiencesListSSR('en')).cards;

    // The mine badge carries the place, so the card uses the place-less title.
    expect(card.title).toMatch(/\.cardTitle$/);
    expect(card.planBadge).toEqual({ code: 'prime', label: 'ExperiencesList.planBadges.prime' });
    expect(card.mineBadge).toEqual({ code: 'chivor', label: 'ExperiencesList.mineBadges.chivor' });
    // Card image first, so the carousel opens on the same photo as before.
    expect(card.images).toHaveLength(2);
    expect(card.images[0]).toBe(card.image);
    // Resolved to the CDN like the card image, not left app-relative.
    expect(card.images[1]).toBe(
      `${new URL(card.image).origin}/images/experiences/x/highlights/highlight-1.webp`,
    );
  });

  // The live feed does not carry the codes yet; the card must render as before.
  it('renders without badges and with a single slide when the feed omits the codes', async () => {
    const feed = listFeed();
    for (const entry of feed.experiences) {
      delete entry.planCode;
      delete entry.mineCode;
      delete entry.card.gallery;
    }
    stubFeed(feed);

    const [card] = (await getExperiencesListSSR('en')).cards;

    expect(card.planBadge).toBeUndefined();
    expect(card.mineBadge).toBeUndefined();
    // No mine badge: the card keeps the full title, so the place is never lost.
    expect(card.title).toMatch(/\.title$/);
    expect(card.images).toEqual([card.image]);
  });

  it('derives the card route from the feed slug', async () => {
    const feed = listFeed();
    stubFeed(feed);

    const data = await getExperiencesListSSR('en');

    expect(data.cards[0].id).toBe(feed.experiences[0].slug);
    expect(data.cards[0].href).toBe(`/experiences/${feed.experiences[0].slug}`);
  });

  it('resolves feed-owned hero video through the CDN', async () => {
    const feed = listFeed();
    feed.media = {
      video: {
        desktop: '/videos/experiences/list/hero.webm',
        mobile: '/videos/experiences/list/hero-mobile.webm',
      },
    };
    stubFeed(feed);

    const data = await getExperiencesListSSR('en');

    expect(data.hero.video).toEqual({
      desktop: 'https://cdn.andeanscapes.com/videos/experiences/list/hero.webm',
      mobile: 'https://cdn.andeanscapes.com/videos/experiences/list/hero-mobile.webm',
    });
  });

  it('resolves the feed-owned hero background through the CDN', async () => {
    const feed = listFeed();
    feed.media = { hero: '/images/experiences/list/hero.webp' };
    stubFeed(feed);

    const data = await getExperiencesListSSR('en');

    expect(data.hero.backgroundImageUrl).toBe(
      'https://cdn.andeanscapes.com/images/experiences/list/hero.webp',
    );
  });

  it('omits the hero video while the feed field is rolling out', async () => {
    const feed = listFeed();
    delete feed.media;
    stubFeed(feed);

    const data = await getExperiencesListSSR('en');

    expect(data.hero.video).toBeUndefined();
  });

  // Regression: dropping the hardcoded default left the hero with no background
  // at all, because the published feed carries no `media` block yet.
  it('always renders a hero background, even with no feed media', async () => {
    const feed = listFeed();
    delete feed.media;
    stubFeed(feed);

    const data = await getExperiencesListSSR('en');

    expect(data.hero.backgroundImageUrl).toBe('/assets/images/hero/h10.webp');
  });

  it('resolves every user-facing string through a mapping, never from the payload', async () => {
    stubFeed(listFeed());

    const data = await getExperiencesListSSR('en');
    const card = data.cards[0];

    // `t` echoes its key, so a mapped field is a dotted key path.
    expect(card.title).toMatch(/^experiences\./);
    expect(card.description).toMatch(/^experiences\./);
    expect(card.tag).toMatch(/^ExperiencesList\./);
    expect(data.sectionTitle).toMatch(/^ExperiencesList\./);
    expect(data.hero.title).toMatch(/^ExperiencesList\./);
    for (const chip of card.metadata) {
      expect(chip).toMatch(/^ExperiencesList\./);
    }
  });

  it('omits the badge when the feed publishes no badgeCode', async () => {
    const feed = listFeed();
    delete feed.experiences[0].card.badgeCode;
    stubFeed(feed);

    const data = await getExperiencesListSSR('en');

    expect(data.cards[0].tag).toBeUndefined();
  });

  it('excludes experiences that are not published', async () => {
    const feed = listFeed();
    const publishedEntries = feed.experiences.filter((entry) => entry.status === 'published');
    expect(publishedEntries.length).toBeGreaterThan(1);
    const [draft, ...published] = publishedEntries;
    draft.status = 'draft';
    stubFeed(feed);

    const data = await getExperiencesListSSR('en');

    expect(data.cards.map((card) => card.id)).toEqual(published.map((entry) => entry.slug));
  });

  it('keeps every highlight after the two fixed chips', async () => {
    const feed = listFeed();
    feed.experiences[0].card.highlightCodes = ['localGuides', 'smallGroups', 'twoMines', 'horsebackRiding'];
    stubFeed(feed);

    const data = await getExperiencesListSSR('en');

    // duration + startsIn + 4 highlights (the schema maximum), none dropped.
    expect(data.cards[0].metadata).toEqual([
      'ExperiencesList.cardMeta.durationDaysNights',
      'ExperiencesList.cardMeta.startsIn',
      'ExperiencesList.localGuides',
      'ExperiencesList.smallGroups',
      'ExperiencesList.twoMines',
      'ExperiencesList.horsebackRiding',
    ]);
  });

  it('promotes privateTour to a photo badge instead of a chip', async () => {
    const feed = listFeed();
    feed.experiences[0].card.highlightCodes = ['localGuides', 'privateTour', 'twoMines'];
    stubFeed(feed);

    const data = await getExperiencesListSSR('en');

    expect(data.cards[0].privateBadge).toEqual({ label: 'ExperiencesList.privateTour' });
    expect(data.cards[0].metadata).not.toContain('ExperiencesList.privateTour');
    expect(data.cards[0].metadata).toContain('ExperiencesList.twoMines');
  });

  it('renders no private badge without the privateTour highlight', async () => {
    const feed = listFeed();
    feed.experiences[0].card.highlightCodes = ['localGuides', 'smallGroups'];
    stubFeed(feed);

    const data = await getExperiencesListSSR('en');

    expect(data.cards[0].privateBadge).toBeUndefined();
  });

  it('rejects a feed with more highlights than the schema allows', async () => {
    expect(HighlightCodeSchema.options.length).toBeGreaterThan(FEED_MAX_HIGHLIGHTS);
    const feed = listFeed();
    // Every highlight code — one more than FEED_MAX_HIGHLIGHTS allows.
    feed.experiences[0].card.highlightCodes = [...HighlightCodeSchema.options];
    stubFeed(feed);

    await expect(getExperiencesListSSR('en')).rejects.toThrow(/Experiences feed unavailable/);
  });

  it('throws when the feed is unavailable instead of rendering an empty catalog', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 500 })));

    await expect(getExperiencesListSSR('en')).rejects.toThrow(/Experiences feed unavailable/);
  });

  it('throws when the feed violates its schema', async () => {
    stubFeed({ schemaVersion: 2, experiences: [{ nope: true }] });

    await expect(getExperiencesListSSR('en')).rejects.toThrow(/Experiences feed unavailable/);
  });
});
