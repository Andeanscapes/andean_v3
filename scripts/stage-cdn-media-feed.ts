/**
 * Stage the one-off feed edit that repoints business media at the CDN.
 *
 * Reads the local copies in `fixtures/` — the same payloads the app validates on
 * read — applies the media mapping below, validates the result against the same
 * schemas, and writes:
 *
 *   feed-migration/rollback/  the payloads as they are published today
 *   feed-migration/next/      the payloads to upload
 *
 * Run it with:
 *   npm run feed:stage-cdn-media
 *
 * Every payload is re-fetched from the live feed first and compared against the
 * local copy. That check is not optional, because `fixtures/` is **test input**,
 * not a mirror of production: nothing in `src/` reads it, and `fetch-fixtures.ts`
 * deliberately keeps a stale copy and exits 0 when the network fails so `npm
 * test` still runs offline. Staging from a stale copy would carry stale prices,
 * availability and review counts into an upload that overwrites the live values —
 * a silent business-data revert dressed up as a media change.
 *
 * Why a script rather than a hand edit: the mapping is not a find-and-replace.
 * `hero/h10.webp` resolves to two different CDN keys depending on where it
 * appears — `hero.webp` (1600w, full-bleed) under `media.hero`, `gallery-1.webp`
 * (1200w, gradient-covered tile) everywhere else. Doing this by hand silently
 * ships the wrong asset at the wrong size, and nothing downstream would catch it
 * because both values satisfy `MediaPathSchema`.
 *
 * Why `rollback/` and not `fixtures/`: `pretest` overwrites `fixtures/` from
 * whatever is live, so the moment the upload lands that directory holds the new
 * payload. The pre-publish copy has to be taken somewhere else or it is gone.
 *
 * This script does not upload. Publishing is a separate, deliberate step.
 */

import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { ZodType } from 'zod';
import type {
  ExperienceFeedV2,
  ExperiencesListFeedV2,
  LandingFeedV2,
} from '../src/lib/schemas/feed/v2';
import {
  ExperienceFeedV2Schema,
  ExperiencesListFeedV2Schema,
  LandingFeedV2Schema,
} from '../src/lib/schemas/feed/v2';
import {
  EXPERIENCES_LIST_FEED_FILE,
  LANDING_FEED_FILE,
  experienceFeedFile,
} from '../src/utils/feedPaths';
import { DEFAULT_FEED_BASE_URL, fetchFeedJson, resolveFeedBaseUrl } from './lib/feed';

const REPO_ROOT = path.resolve(__dirname, '..');
const FIXTURES_DIR = path.join(REPO_ROOT, 'fixtures');
const STAGING_DIR = path.join(REPO_ROOT, 'feed-migration');
const NEXT_DIR = path.join(STAGING_DIR, 'next');
const ROLLBACK_DIR = path.join(STAGING_DIR, 'rollback');

const EXPERIENCE_ID = 'emeraldMining';
const EXPERIENCE_FILE = experienceFeedFile(EXPERIENCE_ID);

/**
 * CDN keys, all verified present in R2 before this script was written.
 *
 * Grouped by the render path that dictates their size, because that is what
 * makes two keys out of one source file necessary:
 *   HERO     `<picture>`, full-bleed, 1600w + an uploaded `-mobile` sibling
 *   CARD     `<picture>` in `ExperienceCardImage`, + `-mobile` sibling
 *   GALLERY  fixed tiles under a heavy gradient, 1200w, no mobile variant
 */
const CDN = {
  experienceHero: '/images/experiences/emerald-mining/hero.webp',
  experienceCard: '/images/experiences/emerald-mining/card.webp',
  gallery1: '/images/experiences/emerald-mining/gallery-1.webp',
  gallery2: '/images/experiences/emerald-mining/gallery-2.webp',
  gallery3: '/images/experiences/emerald-mining/gallery-3.webp',
  hostAvatar: '/images/experiences/emerald-mining/host-avatar.webp',
  tierThumbnail: '/images/experiences/emerald-mining/tier-standard-thumb.webp',
  listHero: '/images/experiences/list-hero.webp',
  landingHero: '/images/brand/landing-hero.webp',
  finalCta: '/images/brand/final-cta.webp',
  categoryEmerald: '/images/brand/categories/emerald-mining.webp',
  categoryNature: '/images/brand/categories/nature.webp',
  categoryRural: '/images/brand/categories/rural.webp',
  categoryHorseback: '/images/brand/categories/horseback.webp',
  heroVideoDesktop: '/videos/experiences/emerald-mining/hero.webm',
  heroVideoMobile: '/videos/experiences/emerald-mining/hero-mobile.webm',
} as const;

/**
 * Legacy source path → CDN key, for the *gallery* contexts only.
 *
 * Deliberately excludes `media.hero` and `media.card`, which are assigned
 * explicitly below. A single flat map covering those would have to pick one
 * winner for `h10.webp` and would therefore be wrong in one of the two places it
 * appears.
 */
const GALLERY_BY_LEGACY_PATH: Readonly<Record<string, string>> = {
  '/assets/images/hero/h10.webp': CDN.gallery1,
  '/assets/images/hero/h7.webp': CDN.gallery2,
  '/assets/images/hero/h8.webp': CDN.gallery3,
};

function fail(message: string): never {
  console.error(`[stage-cdn-media] ${message}`);
  process.exit(1);
}

function readFixture(file: string): unknown {
  const location = path.join(FIXTURES_DIR, file);
  try {
    return JSON.parse(readFileSync(location, 'utf8')) as unknown;
  } catch (err) {
    return fail(
      `cannot read ${location}: ${err instanceof Error ? err.message : String(err)}. ` +
        'Run `npm run fixtures:fetch` first.',
    );
  }
}

/** Parse through the schema the app uses on read, so staging cannot start from a payload the app would reject. */
function parseFixture<T>(file: string, schema: ZodType<T>, raw: unknown): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    return fail(
      `fixtures/${file} does not satisfy its schema:\n${JSON.stringify(result.error.format(), null, 2)}`,
    );
  }
  return result.data;
}

/** Re-validate the transformed payload before it is written, so a bad mapping fails here and not in production. */
function validateStaged<T>(file: string, schema: ZodType<T>, value: unknown): void {
  const result = schema.safeParse(value);
  if (!result.success) {
    fail(
      `staged ${file} does not satisfy its schema:\n${JSON.stringify(result.error.format(), null, 2)}`,
    );
  }
}

function mapGallery(file: string, field: string, value: string): string {
  const mapped = GALLERY_BY_LEGACY_PATH[value];
  if (!mapped) {
    // Refusing beats guessing: an unmapped legacy path means the feed gained an
    // image this script has never seen, and the corresponding CDN object almost
    // certainly was never uploaded.
    fail(`${file}: no CDN key mapped for ${field} = "${value}". Add it to GALLERY_BY_LEGACY_PATH.`);
  }
  return mapped;
}

/** True once every media path in the payload already points at the CDN. */
function isAlreadyMigrated(payload: unknown): boolean {
  return !JSON.stringify(payload).includes('/assets/images/');
}

/**
 * Deep copy so the transform cannot mutate the object the rollback copy is
 * written from. A JSON round-trip is sufficient and appropriate: these payloads
 * are parsed JSON, so there is no prototype or `Date` to preserve.
 */
function cloneJson<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * Fail unless every local copy still matches what the CDN is serving.
 *
 * Compares re-serialized JSON so `fetch-fixtures.ts` pretty-printing is ignored
 * and only real content differences count. A mismatch means the feed moved since
 * the last download: staging would then be based on superseded values, and the
 * upload would overwrite whatever changed with the older data.
 */
async function assertFixturesMatchLiveFeed(files: readonly string[]): Promise<void> {
  const baseUrlResult = resolveFeedBaseUrl(DEFAULT_FEED_BASE_URL);
  if (!baseUrlResult.ok) fail(baseUrlResult.reason);

  const baseUrl = baseUrlResult.url;
  console.log(`[stage-cdn-media] checking fixtures/ against ${baseUrl}`);

  const stale: string[] = [];

  for (const file of files) {
    const result = await fetchFeedJson(`${baseUrl}/${file}`);

    // Unreachable is fatal here, unlike in `fetch-fixtures`. There is no safe
    // way to stage a production upload without confirming the current payload.
    if (!result.ok) {
      fail(`cannot read ${baseUrl}/${file}: ${result.reason}. Staging needs the live payload.`);
    }

    const local = JSON.stringify(readFixture(file));
    const live = JSON.stringify(result.json);

    if (local !== live) {
      stale.push(file);
      console.error(`  ✗ ${file}: local copy differs from the published payload`);
    } else {
      console.log(`  ✓ ${file}`);
    }
  }

  if (stale.length > 0) {
    fail(
      `${stale.length} local copy/copies are stale: ${stale.join(', ')}. ` +
        'Run `npm run fixtures:fetch` and re-run, then re-review the staged diff — ' +
        'the feed changed since the last download.',
    );
  }
}

function writeJson(dir: string, file: string, value: unknown): void {
  // Trailing newline and 2-space indent match `fetch-fixtures.ts`, so a diff
  // between a staged payload and a re-downloaded one is content-only.
  writeFileSync(path.join(dir, file), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function main(): Promise<void> {
  await assertFixturesMatchLiveFeed([
    LANDING_FEED_FILE,
    EXPERIENCES_LIST_FEED_FILE,
    EXPERIENCE_FILE,
  ]);

  const rawLanding = readFixture(LANDING_FEED_FILE);
  const rawList = readFixture(EXPERIENCES_LIST_FEED_FILE);
  const rawExperience = readFixture(EXPERIENCE_FILE);

  // Transform the *parsed* output, not the raw objects. Every v2 schema is
  // `.strict()`, so a successful parse proves the payload carries no key the
  // schema does not model — there is nothing extra to preserve by writing the raw
  // shape back, and the parsed types remove the casts a raw walk would need.
  const parsedLanding = parseFixture(LANDING_FEED_FILE, LandingFeedV2Schema, rawLanding);
  const parsedList = parseFixture(EXPERIENCES_LIST_FEED_FILE, ExperiencesListFeedV2Schema, rawList);
  const parsedExperience = parseFixture(EXPERIENCE_FILE, ExperienceFeedV2Schema, rawExperience);

  if (
    isAlreadyMigrated(rawLanding) &&
    isAlreadyMigrated(rawList) &&
    isAlreadyMigrated(rawExperience)
  ) {
    console.log(
      '[stage-cdn-media] fixtures already reference only CDN media — the published feed ' +
        'has been migrated. Nothing to stage.',
    );
    return;
  }

  const landing = cloneJson<LandingFeedV2>(parsedLanding);
  const list = cloneJson<ExperiencesListFeedV2>(parsedList);
  const experience = cloneJson<ExperienceFeedV2>(parsedExperience);

  // ── experience-emerald-mining.json — the canonical owner ──────────────────
  const expMedia = experience.experience.media;

  expMedia.hero = CDN.experienceHero;
  expMedia.card = CDN.experienceCard;
  expMedia.highlights = expMedia.highlights.map((value, index) =>
    mapGallery(EXPERIENCE_FILE, `experience.media.highlights[${index}]`, value),
  );
  // Both objects are live on the CDN. Publishing this is what removes the need
  // for any source-controlled video default in the hero component.
  expMedia.video = { desktop: CDN.heroVideoDesktop, mobile: CDN.heroVideoMobile };

  experience.experience.host.avatar = CDN.hostAvatar;

  experience.accommodationTiers.forEach((tier, tierIndex) => {
    const label = `accommodationTiers[${tierIndex}].media`;

    tier.media.main = mapGallery(EXPERIENCE_FILE, `${label}.main`, tier.media.main);
    tier.media.thumbnail = CDN.tierThumbnail;
    tier.media.gallery = tier.media.gallery.map((value, index) =>
      mapGallery(EXPERIENCE_FILE, `${label}.gallery[${index}]`, value),
    );

    tier.itinerary.forEach((day, dayIndex) => {
      day.stops.forEach((stop, stopIndex) => {
        const field = `accommodationTiers[${tierIndex}].itinerary[${dayIndex}].stops[${stopIndex}].images`;
        stop.images = stop.images.map((value, index) =>
          mapGallery(EXPERIENCE_FILE, `${field}[${index}]`, value),
        );
      });
    });
  });

  // ── experiences-list.json — card projection + list hero ───────────────────
  for (const entry of list.experiences) {
    if (entry.id !== EXPERIENCE_ID) continue;
    entry.card.image = CDN.experienceCard;
  }
  // `media.video` is intentionally absent: no `videos/experiences/list/*` object
  // has been uploaded, and publishing a path to a missing file renders a hero
  // that fails to load rather than one that falls back.
  list.media = { ...list.media, hero: CDN.listHero };

  // ── landing.json — brand media + bounded projection ───────────────────────
  for (const entry of landing.experiences) {
    if (entry.id !== EXPERIENCE_ID) continue;
    entry.media.hero = CDN.experienceHero;
    entry.media.card = CDN.experienceCard;
  }
  landing.media = {
    hero: CDN.landingHero,
    finalCta: CDN.finalCta,
    categories: {
      emeraldMining: CDN.categoryEmerald,
      nature: CDN.categoryNature,
      rural: CDN.categoryRural,
      horseback: CDN.categoryHorseback,
    },
  };

  validateStaged(LANDING_FEED_FILE, LandingFeedV2Schema, landing);
  validateStaged(EXPERIENCES_LIST_FEED_FILE, ExperiencesListFeedV2Schema, list);
  validateStaged(EXPERIENCE_FILE, ExperienceFeedV2Schema, experience);

  assertProjectionsMatchOwner(landing, list, experience);
  assertNoLegacyMediaRemains({ landing, list, experience });

  mkdirSync(NEXT_DIR, { recursive: true });
  mkdirSync(ROLLBACK_DIR, { recursive: true });

  for (const file of [LANDING_FEED_FILE, EXPERIENCES_LIST_FEED_FILE, EXPERIENCE_FILE]) {
    copyFileSync(path.join(FIXTURES_DIR, file), path.join(ROLLBACK_DIR, file));
  }

  writeJson(NEXT_DIR, LANDING_FEED_FILE, landing);
  writeJson(NEXT_DIR, EXPERIENCES_LIST_FEED_FILE, list);
  writeJson(NEXT_DIR, EXPERIENCE_FILE, experience);

  console.log('[stage-cdn-media] staged 3 payload(s)');
  console.log(`  next/      ${NEXT_DIR.replace(`${REPO_ROOT}/`, '')}`);
  console.log(`  rollback/  ${ROLLBACK_DIR.replace(`${REPO_ROOT}/`, '')}`);
  console.log('');
  console.log('Neither directory is committed. Upload next/, then verify against the CDN.');
}

/**
 * The projections must keep matching the owner after remapping.
 *
 * `src/test/feed-v2/contract.test.ts` asserts this against whatever is
 * published; checking it here means a mapping mistake fails before the upload
 * rather than after, when the failing artifact is already live.
 */
function assertProjectionsMatchOwner(
  landing: LandingFeedV2,
  list: ExperiencesListFeedV2,
  experience: ExperienceFeedV2,
): void {
  const ownerMedia = experience.experience.media;

  const landingMedia = landing.experiences.find((entry) => entry.id === EXPERIENCE_ID)?.media;

  if (landingMedia?.hero !== ownerMedia.hero || landingMedia?.card !== ownerMedia.card) {
    fail('landing.json media projection drifted from the experience owner');
  }

  const listImage = list.experiences.find((entry) => entry.id === EXPERIENCE_ID)?.card.image;

  if (listImage !== ownerMedia.card) {
    fail('experiences-list.json card.image drifted from the experience owner');
  }
}

/** A leftover `/assets/...` path means a field was missed; it would 404 once the local file is deleted. */
function assertNoLegacyMediaRemains(payloads: Record<string, unknown>): void {
  for (const [name, payload] of Object.entries(payloads)) {
    const leftovers = JSON.stringify(payload).match(/"\/assets\/[^"]*"/g);
    if (leftovers) {
      const unique = Array.from(new Set(leftovers)).join(', ');
      fail(`${name}: ${leftovers.length} legacy media path(s) remain: ${unique}`);
    }
  }
}

main();
