/**
 * Tests for the catalog derived from the experiences list feed.
 *
 * There is no dedicated catalog feed: routes and slugs come from
 * `experiences-list.json`, and the SEO namespace from
 * `EXPERIENCE_METADATA_NAMESPACE` (v2 dropped it from the payload). These guard
 * the derivation, since the catalog drives generateStaticParams,
 * generateMetadata and sitemap.xml — a silent regression here removes pages from
 * the site rather than breaking a render.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EXPERIENCES_LIST_FIXTURE, cloneFixture } from '@/test/fixtures';

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => (key: string) => key),
}));

import {
  getExperiencesCatalogSSR,
  getExperiencePathListSSR,
  getExperienceByNameSSR,
} from './experiences-catalog.service';

/** The v2 feed with its entries replaced, so the shape stays schema-valid. */
function stubFeed(entries: unknown[]) {
  const feed = { ...cloneFixture(EXPERIENCES_LIST_FIXTURE), experiences: entries };
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) =>
      String(url).endsWith('/experiences-list.json')
        ? { ok: true, json: async () => feed }
        : { ok: false, status: 404 },
    ),
  );
}

/** A published entry cloned from the fixture, with overrides applied. */
function entry(overrides: Record<string, unknown> = {}) {
  return { ...cloneFixture(EXPERIENCES_LIST_FIXTURE).experiences[0], ...overrides };
}

describe('getExperiencesCatalogSSR', () => {
  beforeEach(() => {
    process.env.REMOTE_DATA_BASE_URL = 'https://cdn.example.com/services';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.REMOTE_DATA_BASE_URL;
  });

  it('derives the catalog from the list feed', async () => {
    stubFeed([entry()]);

    expect(await getExperiencesCatalogSSR()).toEqual([
      {
        experienceId: 'emeraldMining',
        experienceName: 'emerald-mining-adventure',
        metadataNamespace: 'EmeraldMiningAdventure',
      },
    ]);
  });

  it('uses the slug as the URL segment', async () => {
    stubFeed([entry({ slug: 'my-slug' })]);

    expect(await getExperiencePathListSSR()).toEqual(['my-slug']);
  });

  it('keeps experienceId and experienceName distinct', async () => {
    stubFeed([entry()]);

    const [item] = await getExperiencesCatalogSSR();

    // The slug drives the URL; the id drives the data file name.
    expect(item.experienceName).toBe('emerald-mining-adventure');
    expect(item.experienceId).toBe('emeraldMining');
  });

  it('excludes an experience that is not published', async () => {
    stubFeed([entry({ status: 'draft' })]);

    expect(await getExperiencesCatalogSSR()).toEqual([]);
  });

  it('resolves an experience by its route segment', async () => {
    stubFeed([entry()]);

    const found = await getExperienceByNameSSR('emerald-mining-adventure');
    expect(found?.experienceId).toBe('emeraldMining');

    expect(await getExperienceByNameSSR('does-not-exist')).toBeNull();
  });

  it('throws when the feed is unavailable', async () => {
    // There is no local fallback: route generation must fail loudly rather than
    // silently produce an empty catalog, which would drop every experience page
    // from the build and the sitemap.
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 500 })));

    await expect(getExperiencesCatalogSSR()).rejects.toThrow(/Experiences feed unavailable/);
  });

  it('throws when the feed violates its schema', async () => {
    stubFeed([{ nope: true }]);

    await expect(getExperiencesCatalogSSR()).rejects.toThrow(/Experiences feed unavailable/);
  });
});
