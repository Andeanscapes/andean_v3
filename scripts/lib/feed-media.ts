/**
 * Which media objects the feed actually references.
 *
 * Shared by `media:pull` (what to download) and `media:push` (what is allowed to
 * be uploaded). Keeping one implementation means the two commands can never
 * disagree about which keys are real — a mismatch there is what lets a typo'd
 * filename become a published object nothing reads.
 *
 * Two directories are read and unioned:
 *
 *   fixtures/              what is published today
 *   feed-migration/next/   what is staged but not yet published
 *
 * Before a media migration lands, the CDN keys exist only in the staged payload,
 * so reading `fixtures/` alone would report an empty set and make an incomplete
 * mirror look correct.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { FOOTER_TRUST_GALLERY } from '../../src/constant/SiteConfig';
import { resolveMediaUrl } from '../../src/utils/mediaUrl';
import { getResponsiveImageSrc, hasImageExtension } from '../../src/utils/responsiveImage';
import { readLength } from './cdn';

const REPO_ROOT = path.resolve(__dirname, '../..');

/** In precedence-free order; the result is a union. */
const SOURCE_DIRS = [
  { dir: path.join(REPO_ROOT, 'fixtures'), label: 'fixtures' },
  { dir: path.join(REPO_ROOT, 'feed-migration/next'), label: 'feed-migration/next' },
] as const;

/** Mirrors `isCdnMediaPath` in `src/utils/mediaUrl.ts`. */
function isCdnMediaPath(value: string): boolean {
  return value.startsWith('/images/') || value.startsWith('/videos/');
}

/**
 * Collect every CDN media path in a parsed JSON tree.
 *
 * Walks the same shape `resolveMediaUrlsDeep` walks, so the set collected here
 * is exactly the set the services resolve to CDN URLs at read time.
 */
export function collectMediaPaths(value: unknown, into: Set<string>): void {
  if (typeof value === 'string') {
    if (isCdnMediaPath(value)) into.add(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectMediaPaths(item, into);
    return;
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectMediaPaths(item, into);
  }
}

export interface ReferencedMedia {
  /** Every `/images/...` and `/videos/...` path the local feed payloads point at. */
  keys: Set<string>;
  /** How many payload files were read, across both directories. */
  fileCount: number;
  /** Which directories contributed, for reporting. */
  sources: string[];
}

export function readReferencedMedia(): ReferencedMedia {
  const keys = new Set<string>();
  const sources: string[] = [];
  let fileCount = 0;

  for (const { dir, label } of SOURCE_DIRS) {
    if (!existsSync(dir)) continue;

    const files = readdirSync(dir).filter((file) => file.endsWith('.json'));
    if (files.length === 0) continue;

    for (const file of files) {
      collectMediaPaths(JSON.parse(readFileSync(path.join(dir, file), 'utf8')), keys);
      fileCount += 1;
    }

    sources.push(label);
  }

  return { keys, fileCount, sources };
}

/**
 * Every key that may legitimately be published: the feed's own references plus
 * the `-mobile` sibling of each image.
 *
 * The siblings are not in the feed and never will be — components derive them at
 * render time with `getResponsiveImageSrc`, so `hero.webp` in the feed implies
 * `hero-mobile.webp` on the CDN. Treating them as unreferenced would reject the
 * entire responsive half of the media set.
 */
export function withResponsiveSiblings(
  keys: Iterable<string>,
  deriveMobile: (key: string) => string | null,
): Set<string> {
  const all = new Set<string>(Array.from(keys));

  for (const key of Array.from(all)) {
    // A `-mobile` key has no sibling of its own; deriving one would admit
    // `hero-mobile-mobile.webp` as a publishable key.
    if (path.basename(key).includes('-mobile')) continue;

    const mobile = deriveMobile(key);
    if (mobile) all.add(mobile);
  }

  return all;
}

/** Directory on the CDN that holds brand-level media. */
export const BRAND_MEDIA_PREFIX = '/images/brand';

/**
 * `landing-hero.webp` and `landing-hero-<n>.webp`, but never a `-mobile` crop.
 *
 * The numbered form is the whole convention for adding a hero: drop
 * `landing-hero-04.webp` next to the others and it is discovered. `-mobile`
 * siblings are derived at render time, so listing them as variants would put a
 * phone crop on desktop.
 */
const HERO_VARIANT_PATTERN = /^landing-hero(?:-(\d+))?\.webp$/;

/**
 * Whether a key follows the landing-hero naming convention, including the
 * `-mobile` crop.
 *
 * `media:push` uses this to allow a brand-new hero through the reference guard.
 * A file named `landing-hero-04.webp` is self-evidently a future hero, so
 * refusing it taught the operator to reach for `--allow-orphan`, which disables
 * the guard for *everything*. Recognising the convention keeps the guard sharp
 * where it earns its keep: `landing-heor-04.webp` still fails, with the intended
 * name suggested.
 */
export function isHeroVariantKey(key: string): boolean {
  if (!key.startsWith(`${BRAND_MEDIA_PREFIX}/`)) return false;

  const basename = path.basename(key);
  return HERO_VARIANT_PATTERN.test(basename.replace('-mobile.webp', '.webp'));
}

/** Sort key: the unnumbered original first, then numerically ascending. */
function heroOrder(basename: string): number {
  const match = HERO_VARIANT_PATTERN.exec(basename);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return match[1] === undefined ? -1 : Number(match[1]);
}

/**
 * The hero pool, derived from filenames rather than hand-maintained.
 *
 * Unions what is in the local mirror with what the feed already publishes, so
 * the result never silently drops a live variant just because `r2-cache/` is
 * incomplete on this machine — `media:pull` only downloads what the feed
 * references, so a brand-new file exists locally while an older one may not.
 *
 * Order is deterministic so republishing an unchanged set produces no diff.
 */
export function discoverHeroVariants(
  localBasenames: readonly string[],
  publishedKeys: readonly string[],
): string[] {
  const names = new Set<string>();

  for (const basename of localBasenames) {
    if (HERO_VARIANT_PATTERN.test(basename)) names.add(basename);
  }

  for (const key of publishedKeys) {
    if (!key.startsWith(`${BRAND_MEDIA_PREFIX}/`)) continue;
    const basename = path.basename(key);
    if (HERO_VARIANT_PATTERN.test(basename)) names.add(basename);
  }

  return Array.from(names)
    .sort((a, b) => heroOrder(a) - heroOrder(b) || a.localeCompare(b))
    .map((basename) => `${BRAND_MEDIA_PREFIX}/${basename}`);
}

/**
 * Every media key the landing page renders through `<picture>`, and therefore
 * every key that needs a published `-mobile` sibling.
 *
 * Derived from the components rather than assumed, because the sibling is never
 * named by the feed: `getResponsiveImageSrc` builds it at render time, so a
 * missing file is a 404 on phones only — invisible on desktop and in every test.
 *
 *   media.hero + heroVariants   `LandingHeroBrand`
 *   media.finalCta              `FinalCtaBanner`
 *   media.categories.*          `LandingCategoryCard`
 *   experiences[].media.card    `LandingFeaturedExperienceCard`
 *   FOOTER_TRUST_GALLERY        `Footer`, app-owned and absent from the feed
 *
 * `experiences[].media.hero` is deliberately **excluded**: `LandingPage` does not
 * mount `ExperienceHero`, so nothing on this page renders it through `<picture>`
 * and demanding a sibling for it would fail the gate on a file nobody requests.
 *
 * Add to this list in the same change that adds a `<picture>` consumer.
 */
export function landingResponsiveMediaKeys(landing: {
  media?: {
    hero: string;
    heroVariants?: readonly string[];
    finalCta: string;
    categories: Readonly<Record<string, string>>;
  };
  experiences: readonly { media: { card: string } }[];
}): string[] {
  const keys: string[] = [...FOOTER_TRUST_GALLERY];

  if (landing.media) {
    keys.push(
      landing.media.hero,
      ...(landing.media.heroVariants ?? []),
      landing.media.finalCta,
      ...Object.values(landing.media.categories),
    );
  }

  for (const experience of landing.experiences) keys.push(experience.media.card);

  return keys;
}

export interface MissingSibling {
  key: string;
  mobileKey: string;
  /** `absent` when the object is not in R2; otherwise why the check failed. */
  reason: 'absent' | string;
}

export interface SiblingReport {
  /** Distinct keys that were actually probed. */
  checked: number;
  missing: MissingSibling[];
}

/**
 * Confirm every image key has its `-mobile` sibling published.
 *
 * Components derive that path at render time: `LandingHeroBrand` emits
 * `<source media="(max-width: 767px)">` from `getResponsiveImageSrc(...).mobile`
 * unconditionally, and a browser does **not** fall back to `<img>` when a
 * *matched* `<source>` 404s. A missing sibling is therefore a broken hero on
 * every phone rather than a degraded one, and nothing else catches it: both
 * paths satisfy `MediaPathSchema`, and `media:push --allow-orphan` skips its
 * reference check entirely.
 *
 * Keys are deduplicated — the hero is commonly listed in `heroVariants` as well,
 * and probing it twice would both waste a round trip and overstate the count.
 *
 * Only raster images are probed. Videos have no `-mobile` convention, and SVG
 * is vector: the optimizer never resizes it and no `-mobile.svg` is ever
 * produced, so deriving one would invent a URL nothing requests. `.svg` counts
 * as an image for `hasImageExtension`, which is why it is excluded explicitly.
 *
 * Reads go to origin with a cache buster, because the CDN keys HEAD and GET
 * separately and an edge answer can describe an object R2 no longer holds.
 */
export async function findMissingResponsiveSiblings(
  keys: readonly string[],
): Promise<SiblingReport> {
  const distinct = Array.from(new Set(keys)).filter(
    (key) =>
      hasImageExtension(key) &&
      path.extname(key).toLowerCase() !== '.svg' &&
      !path.basename(key).includes('-mobile'),
  );

  const results = await Promise.all(
    distinct.map(async (key) => {
      const mobileKey = getResponsiveImageSrc(key).mobile;
      const result = await readLength(resolveMediaUrl(mobileKey), true);

      if (result.status === 'found') return null;

      return {
        key,
        mobileKey,
        reason: result.status === 'absent' ? 'absent' : result.reason,
      } satisfies MissingSibling;
    }),
  );

  return {
    checked: distinct.length,
    missing: results.filter((entry): entry is MissingSibling => entry !== null),
  };
}

/**
 * The allowed key most similar to `candidate`, when one is close enough to be a
 * plausible typo.
 *
 * Levenshtein distance over the basename, because that is where the mistake
 * lands (`laning-hero-mobile` for `landing-hero-mobile`). Candidates are limited
 * to the same file extension: without that, a missing `.webp` was "corrected" to
 * an unrelated `.webm`, which is worse than no suggestion.
 */
export function nearestKey(candidate: string, allowed: readonly string[]): string | null {
  const name = path.basename(candidate);
  const extension = path.extname(candidate).toLowerCase();

  let best: { key: string; distance: number } | null = null;

  for (const key of allowed) {
    if (path.extname(key).toLowerCase() !== extension) continue;

    const distance = editDistance(name, path.basename(key));
    if (!best || distance < best.distance) best = { key, distance };
  }

  if (!best) return null;

  // Up to a quarter of the name may differ. Two transposed characters in
  // `landing-hero-mobile.webp` is 2 of 24; an unrelated name is far more.
  return best.distance <= Math.max(1, Math.floor(name.length / 4)) ? best.key : null;
}

function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous = current;
  }

  return previous[b.length];
}
