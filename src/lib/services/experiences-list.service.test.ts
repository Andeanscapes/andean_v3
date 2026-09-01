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
import { EXPERIENCES_LIST_FIXTURE, cloneFixture } from '@/test/fixtures';

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
  let consoleError: ReturnType<typeof vi.spyOn>;

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

    expect(data.cards).toHaveLength(1);
    expect(data.cards[0].price).toBe(feed.experiences[0].card.fromPrice.amount);
    // One request total: the list feed. No per-card fan-out.
    expect(mockFetch).toHaveBeenCalledTimes(1);
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
    feed.experiences[0].status = 'draft';
    stubFeed(feed);

    const data = await getExperiencesListSSR('en');

    expect(data.cards).toEqual([]);
  });

  it('caps card metadata at three chips', async () => {
    const feed = listFeed();
    feed.experiences[0].card.highlightCodes = ['transportIncluded', 'smallGroups', 'localGuides'];
    stubFeed(feed);

    const data = await getExperiencesListSSR('en');

    // duration + startsIn + 3 highlights = 5 candidates, truncated to 3.
    expect(data.cards[0].metadata).toHaveLength(3);
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
