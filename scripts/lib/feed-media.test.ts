/**
 * Unit coverage for the feed-derived media key set.
 *
 * These decide which keys `media:push` is willing to publish, so a wrong answer
 * either blocks legitimate media or lets a typo become a live object nothing
 * reads. Pure functions only — no network, no `fixtures/`.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  collectMediaPaths,
  discoverHeroVariants,
  findMissingResponsiveSiblings,
  isHeroVariantKey,
  landingResponsiveMediaKeys,
  nearestKey,
  withResponsiveSiblings,
} from './feed-media';
import { FOOTER_TRUST_GALLERY } from '../../src/constant/SiteConfig';

/**
 * Every `<picture>` consumer needs a published `-mobile` sibling, and the
 * sibling is derived at render time rather than named by the feed — so this set
 * is the only thing standing between a component change and a hero, tile or card
 * that 404s on phones and nowhere else.
 */
describe('landingResponsiveMediaKeys', () => {
  const LANDING = {
    media: {
      hero: '/images/brand/landing-hero.webp',
      heroVariants: ['/images/brand/landing-hero-01.webp'],
      finalCta: '/images/brand/final-cta.webp',
      categories: {
        emeraldMining: '/images/brand/categories/emerald-mining.webp',
        nature: '/images/brand/categories/nature.webp',
        rural: '/images/brand/categories/rural.webp',
        horseback: '/images/brand/categories/horseback.webp',
      },
    },
    experiences: [{ media: { card: '/images/experiences/emerald-mining/card.webp' } }],
  };

  it('covers every media path the landing page renders through <picture>', () => {
    const keys = landingResponsiveMediaKeys(LANDING);

    for (const expected of [
      LANDING.media.hero,
      ...LANDING.media.heroVariants,
      LANDING.media.finalCta,
      ...Object.values(LANDING.media.categories),
      LANDING.experiences[0].media.card,
    ]) {
      expect(keys, expected).toContain(expected);
    }
  });

  /** App-owned and absent from the feed, but rendered on every route. */
  it('includes the footer gallery, which the feed never names', () => {
    const keys = landingResponsiveMediaKeys(LANDING);
    for (const key of FOOTER_TRUST_GALLERY) expect(keys).toContain(key);
  });

  /**
   * `LandingPage` does not mount `ExperienceHero`, so requiring a sibling for
   * this key would fail the gate on a file no page requests.
   */
  it('excludes experience hero art the landing page does not render', () => {
    // Assigned first: a direct literal would trip excess-property checking, and
    // the point here is that the real payload carries `hero` alongside `card`.
    const withHero = {
      media: {
        card: '/images/experiences/emerald-mining/card.webp',
        hero: '/images/experiences/emerald-mining/hero.webp',
      },
    };
    const keys = landingResponsiveMediaKeys({ ...LANDING, experiences: [withHero] });

    expect(keys).not.toContain('/images/experiences/emerald-mining/hero.webp');
  });

  /** The media block is optional during the staged rollout. */
  it('still returns the app-owned keys when the feed carries no media block', () => {
    expect(landingResponsiveMediaKeys({ experiences: [] })).toEqual([...FOOTER_TRUST_GALLERY]);
  });
});

describe('collectMediaPaths', () => {
  it('collects CDN media paths from a nested payload', () => {
    const found = new Set<string>();
    collectMediaPaths(
      {
        media: { hero: '/images/brand/landing-hero.webp', categories: {} },
        experiences: [{ card: { image: '/images/x/card.webp' } }],
        video: { desktop: '/videos/x/hero.webm' },
      },
      found,
    );

    expect(Array.from(found).sort()).toEqual([
      '/images/brand/landing-hero.webp',
      '/images/x/card.webp',
      '/videos/x/hero.webm',
    ]);
  });

  /** Mirrors the guard in `resolveMediaUrl`: only `/images/` and `/videos/` are CDN media. */
  it('ignores local assets, internal hrefs and absolute URLs', () => {
    const found = new Set<string>();
    collectMediaPaths(
      {
        fallback: '/assets/images/hero/h0.webp',
        href: '/experiences',
        anchor: '#landing-reviews',
        external: 'https://example.com/x.webp',
        svg: '/landing/map.svg',
      },
      found,
    );

    expect(Array.from(found)).toEqual([]);
  });

  it('ignores non-string values', () => {
    const found = new Set<string>();
    collectMediaPaths({ count: 5, ok: true, nothing: null }, found);
    expect(Array.from(found)).toEqual([]);
  });
});

describe('withResponsiveSiblings', () => {
  const deriveMobile = (key: string): string | null =>
    key.endsWith('.webp') ? key.replace(/\.webp$/, '-mobile.webp') : null;

  /**
   * The regression this guards: `-mobile` variants are never in the feed —
   * components derive them at render time — so comparing uploads against the raw
   * feed set rejected every responsive image in the cache.
   */
  it('admits the derived mobile sibling of each image', () => {
    const all = withResponsiveSiblings(['/images/brand/landing-hero.webp'], deriveMobile);

    expect(Array.from(all).sort()).toEqual([
      '/images/brand/landing-hero-mobile.webp',
      '/images/brand/landing-hero.webp',
    ]);
  });

  it('leaves keys with no mobile form alone', () => {
    const all = withResponsiveSiblings(['/videos/x/hero.webm'], deriveMobile);
    expect(Array.from(all)).toEqual(['/videos/x/hero.webm']);
  });

  it('does not derive a sibling of a sibling', () => {
    const all = withResponsiveSiblings(
      ['/images/a.webp', '/images/a-mobile.webp'],
      deriveMobile,
    );

    expect(Array.from(all).sort()).toEqual(['/images/a-mobile.webp', '/images/a.webp']);
  });
});

describe('nearestKey', () => {
  const allowed = [
    '/images/brand/landing-hero.webp',
    '/images/brand/landing-hero-mobile.webp',
    '/images/brand/final-cta.webp',
    '/videos/experiences/emerald-mining/hero.webm',
  ];

  /** The exact typo that reached the bucket before this check existed. */
  it('suggests the intended key for a transposition typo', () => {
    expect(nearestKey('/images/brand/laning-hero-mobile.webp', allowed)).toBe(
      '/images/brand/landing-hero-mobile.webp',
    );
  });

  /**
   * The regression this guards: without an extension filter a stray `.webp`
   * was "corrected" to an unrelated `.webm`, which is worse than staying quiet.
   */
  it('never suggests a key of a different type', () => {
    expect(nearestKey('/images/x/hero-mobile.webp', ['/videos/x/hero-mobile.webm'])).toBeNull();
  });

  it('stays quiet for a genuinely new key', () => {
    expect(nearestKey('/images/brand/seasonal-campaign-banner.webp', allowed)).toBeNull();
  });

  it('returns null when nothing is allowed', () => {
    expect(nearestKey('/images/a.webp', [])).toBeNull();
  });

  it('matches on the basename, so a moved file still resolves', () => {
    expect(nearestKey('/images/elsewhere/final-cta.webp', allowed)).toBe(
      '/images/brand/final-cta.webp',
    );
  });
});

/**
 * The guard that stops a hero variant shipping without its mobile crop.
 *
 * `fetch` is stubbed throughout: this must never reach the live CDN. The
 * failure branches matter more than the happy path — an earlier revision
 * reported every key as verified even when some were missing.
 */
describe('findMissingResponsiveSiblings', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /** 206 with a `content-range` total is what `readLength` treats as found. */
  function foundResponse() {
    return new Response(null, {
      status: 206,
      headers: { 'content-range': 'bytes 0-1023/61390' },
    });
  }

  it('reports nothing when every sibling is published', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(foundResponse()));

    const report = await findMissingResponsiveSiblings([
      '/images/brand/landing-hero-01.webp',
      '/images/brand/landing-hero-02.webp',
    ]);

    expect(report).toEqual({ checked: 2, missing: [] });
  });

  it('reports the derived key when the sibling is absent', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 404 })));

    const report = await findMissingResponsiveSiblings(['/images/brand/landing-hero-01.webp']);

    expect(report.checked).toBe(1);
    expect(report.missing).toEqual([
      {
        key: '/images/brand/landing-hero-01.webp',
        mobileKey: '/images/brand/landing-hero-01-mobile.webp',
        reason: 'absent',
      },
    ]);
  });

  /** An unreachable CDN must not be reported as a published sibling. */
  it('reports a read failure rather than passing it', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNRESET')));

    const report = await findMissingResponsiveSiblings(['/images/brand/landing-hero-01.webp']);

    expect(report.missing).toHaveLength(1);
    expect(report.missing[0].reason).toBe('ECONNRESET');
  });

  /** `hero` is normally listed in `heroVariants` too; probing it twice overstates the count. */
  it('deduplicates repeated keys', async () => {
    const mock = vi.fn().mockResolvedValue(foundResponse());
    vi.stubGlobal('fetch', mock);

    const report = await findMissingResponsiveSiblings([
      '/images/brand/landing-hero.webp',
      '/images/brand/landing-hero.webp',
    ]);

    expect(report.checked).toBe(1);
    expect(mock).toHaveBeenCalledTimes(1);
  });

  /** Only images carry the `-mobile` convention. */
  it('skips videos, svg and keys that are already mobile', async () => {
    const mock = vi.fn().mockResolvedValue(foundResponse());
    vi.stubGlobal('fetch', mock);

    const report = await findMissingResponsiveSiblings([
      '/videos/experiences/x/hero.webm',
      '/images/brand/logo.svg',
      '/images/brand/landing-hero-mobile.webp',
    ]);

    expect(report).toEqual({ checked: 0, missing: [] });
    expect(mock).not.toHaveBeenCalled();
  });

  it('bypasses the edge cache so a stale answer cannot pass the gate', async () => {
    const mock = vi.fn().mockResolvedValue(foundResponse());
    vi.stubGlobal('fetch', mock);

    await findMissingResponsiveSiblings(['/images/brand/landing-hero-01.webp']);

    expect(String(mock.mock.calls[0][0])).toMatch(/__origin=\d+/);
  });
});

/**
 * Adding a hero must be "drop the file in", not "hand-edit JSON".
 *
 * Pure filename logic — the CDN verification that follows it lives in
 * `findMissingResponsiveSiblings` and is covered above.
 */
describe('discoverHeroVariants', () => {
  it('discovers numbered variants from the local mirror', () => {
    expect(
      discoverHeroVariants(
        ['landing-hero-02.webp', 'landing-hero-01.webp', 'landing-hero-03.webp'],
        [],
      ),
    ).toEqual([
      '/images/brand/landing-hero-01.webp',
      '/images/brand/landing-hero-02.webp',
      '/images/brand/landing-hero-03.webp',
    ]);
  });

  /** The unnumbered original is the canonical hero and leads the pool. */
  it('orders the unnumbered hero first, then numerically', () => {
    expect(
      discoverHeroVariants(
        ['landing-hero-10.webp', 'landing-hero-02.webp', 'landing-hero.webp'],
        [],
      ),
    ).toEqual([
      '/images/brand/landing-hero.webp',
      '/images/brand/landing-hero-02.webp',
      '/images/brand/landing-hero-10.webp',
    ]);
  });

  /** `-mobile` crops are derived at render time; as variants they'd hit desktop. */
  it('never treats a mobile crop as a variant', () => {
    expect(
      discoverHeroVariants(['landing-hero-01.webp', 'landing-hero-01-mobile.webp'], []),
    ).toEqual(['/images/brand/landing-hero-01.webp']);
  });

  /** `r2-cache/` is incomplete on a fresh clone, so the feed must still count. */
  it('keeps published variants that are missing locally', () => {
    expect(
      discoverHeroVariants(
        ['landing-hero-03.webp'],
        ['/images/brand/landing-hero.webp', '/images/brand/landing-hero-01.webp'],
      ),
    ).toEqual([
      '/images/brand/landing-hero.webp',
      '/images/brand/landing-hero-01.webp',
      '/images/brand/landing-hero-03.webp',
    ]);
  });

  it('ignores unrelated brand media and other directories', () => {
    expect(
      discoverHeroVariants(
        ['final-cta.webp', 'logo.svg', 'landing-hero-01.webp'],
        ['/images/experiences/emerald-mining/hero.webp', '/videos/x/landing-hero-09.webp'],
      ),
    ).toEqual(['/images/brand/landing-hero-01.webp']);
  });

  it('is stable, so republishing an unchanged set produces no diff', () => {
    const a = discoverHeroVariants(['landing-hero-02.webp', 'landing-hero.webp'], []);
    const b = discoverHeroVariants(['landing-hero.webp', 'landing-hero-02.webp'], []);
    expect(a).toEqual(b);
  });
});

/**
 * What `media:push` will publish without `--allow-orphan`.
 *
 * The balance this has to strike: a new hero must go through (or the operator
 * learns to pass `--allow-orphan` and disables the guard for everything), while
 * a typo must not.
 */
describe('isHeroVariantKey', () => {
  it('accepts the hero convention and its mobile crop', () => {
    for (const key of [
      '/images/brand/landing-hero.webp',
      '/images/brand/landing-hero-mobile.webp',
      '/images/brand/landing-hero-04.webp',
      '/images/brand/landing-hero-04-mobile.webp',
      '/images/brand/landing-hero-12.webp',
    ]) {
      expect(isHeroVariantKey(key), key).toBe(true);
    }
  });

  /** The whole reason the guard exists. */
  it('rejects a typo so the suggestion still fires', () => {
    for (const key of [
      '/images/brand/landing-heor-04.webp',
      '/images/brand/landing-hero-04.jpg',
      '/images/brand/landing-hero-x.webp',
      '/images/brand/hero-04.webp',
    ]) {
      expect(isHeroVariantKey(key), key).toBe(false);
    }
  });

  /** Directory matters: the convention is brand-scoped. */
  it('rejects the same name outside /images/brand', () => {
    expect(isHeroVariantKey('/images/experiences/x/landing-hero-04.webp')).toBe(false);
    expect(isHeroVariantKey('/videos/brand/landing-hero-04.webp')).toBe(false);
  });
});
