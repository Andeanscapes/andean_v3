/**
 * Stage the landing hero pool from the filenames on disk.
 *
 * Adding a hero should be dropping a file in, not hand-editing JSON. This reads
 * `r2-cache/images/brand/`, unions it with what the feed already publishes, and
 * writes the resulting `media.heroVariants` into the staging directory:
 *
 *   feed-migration/rollback/  the payloads as published today
 *   feed-migration/next/      the payloads to upload
 *
 * Run it with:
 *   npm run feed:stage-hero-variants
 *
 * Then review and publish:
 *   npm run feed:publish -- --confirm
 *
 * It does not upload. Publishing stays a separate, deliberate step, because
 * these payloads carry real prices and availability and the bucket has no
 * object versioning.
 *
 * Why the union rather than the directory alone: `media:pull` only downloads
 * what the feed references, so on any given machine `r2-cache/` holds the
 * variants the feed knows about plus whatever was just added. Staging from the
 * directory alone would drop a live variant that simply was not pulled here.
 *
 * Every candidate is verified against the CDN before it is staged — the object
 * itself **and** its `-mobile` sibling. That ordering matters: the feed is the
 * only thing the site reads, so publishing a key whose object does not exist
 * turns the hero into a 404 for the fraction of visits that pick it, and a
 * missing `-mobile` sibling breaks it on phones only, which is the hardest case
 * to notice.
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { LandingFeedV2Schema } from '../src/lib/schemas/feed/v2';
import type { LandingFeedV2 } from '../src/lib/schemas/feed/v2';
import { resolveMediaUrl } from '../src/utils/mediaUrl';
import {
  EXPERIENCES_LIST_FEED_FILE,
  LANDING_FEED_FILE,
  experienceFeedFile,
} from '../src/utils/feedPaths';
import { readLength } from './lib/cdn';
import {
  BRAND_MEDIA_PREFIX,
  discoverHeroVariants,
  findMissingResponsiveSiblings,
} from './lib/feed-media';

const REPO_ROOT = path.resolve(__dirname, '..');
const FIXTURES_DIR = path.join(REPO_ROOT, 'fixtures');
const CACHE_DIR = path.join(REPO_ROOT, 'r2-cache');
const STAGING_DIR = path.join(REPO_ROOT, 'feed-migration');
const NEXT_DIR = path.join(STAGING_DIR, 'next');
const ROLLBACK_DIR = path.join(STAGING_DIR, 'rollback');

/** `publish-feed.ts` uploads all three, so all three have to be staged. */
const PAYLOAD_FILES = [
  LANDING_FEED_FILE,
  EXPERIENCES_LIST_FEED_FILE,
  experienceFeedFile('emeraldMining'),
] as const;

function fail(message: string): never {
  console.error(`[stage-hero-variants] ${message}`);
  process.exit(1);
}

function localBrandFilenames(): string[] {
  const dir = path.join(CACHE_DIR, BRAND_MEDIA_PREFIX.replace(/^\//, ''));
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
}

/** Refuse any key whose object is not actually on the CDN. */
async function assertPublished(keys: readonly string[]): Promise<void> {
  const missing: string[] = [];

  for (const key of keys) {
    const result = await readLength(resolveMediaUrl(key), true);
    if (result.status === 'found') continue;

    missing.push(
      result.status === 'absent' ? key : `${key} (could not verify: ${result.reason})`,
    );
  }

  if (missing.length > 0) {
    fail(
      `these variants are not published:\n` +
        missing.map((entry) => `  ✗ ${entry}`).join('\n') +
        '\n\nUpload them first with `npm run media:sync:new`, then re-run this.',
    );
  }
}

async function main(): Promise<void> {
  const landingPath = path.join(FIXTURES_DIR, LANDING_FEED_FILE);

  if (!existsSync(landingPath)) {
    fail(`${LANDING_FEED_FILE} is missing from fixtures/. Run \`npm run fixtures:fetch\` first.`);
  }

  // Kept as the raw tree, not the Zod output, so the staged file can be written
  // with its original key order. Rebuilding from the parsed object reorders keys
  // and buries the one real change in a reordering diff — which defeats
  // reviewing `next/` against `rollback/` before publishing.
  const raw = JSON.parse(readFileSync(landingPath, 'utf8')) as Record<string, unknown>;

  const parsed = LandingFeedV2Schema.safeParse(raw);
  if (!parsed.success) {
    fail(
      `fixtures/${LANDING_FEED_FILE} does not satisfy its schema:\n` +
        JSON.stringify(parsed.error.format(), null, 2),
    );
  }

  const landing: LandingFeedV2 = parsed.data;

  if (!landing.media) {
    fail(
      `fixtures/${LANDING_FEED_FILE} carries no media block, so there is no hero to vary. ` +
        'Publish brand media first.',
    );
  }

  const published = [landing.media.hero, ...(landing.media.heroVariants ?? [])];
  const variants = discoverHeroVariants(localBrandFilenames(), published);

  if (variants.length === 0) {
    fail(
      `no hero variants found. Expected files matching ` +
        `\`landing-hero.webp\` or \`landing-hero-<n>.webp\` in r2-cache${BRAND_MEDIA_PREFIX}/.`,
    );
  }

  console.log(`[stage-hero-variants] ${variants.length} variant(s) discovered:`);
  for (const key of variants) {
    const status = published.includes(key) ? '' : '  (new)';
    console.log(`  • ${key}${status}`);
  }

  await assertPublished(variants);

  // A matched `<source>` that 404s does not fall back to `<img>`, so a missing
  // sibling is a broken hero on phones rather than a degraded one.
  const { missing } = await findMissingResponsiveSiblings(variants);
  if (missing.length > 0) {
    fail(
      'these variants have no published `-mobile` sibling:\n' +
        missing
          .map((entry) =>
            entry.reason === 'absent'
              ? `  ✗ ${entry.key} -> ${entry.mobileKey}`
              : `  ✗ ${entry.mobileKey} (${entry.reason})`,
          )
          .join('\n') +
        '\n\nAdd the `-mobile` crop beside each source and run `npm run media:sync:new`.',
    );
  }

  const unchanged =
    JSON.stringify(landing.media.heroVariants ?? []) === JSON.stringify(variants);

  if (unchanged) {
    console.log('[stage-hero-variants] the published feed already carries this exact pool — nothing to stage.');
    return;
  }

  // Mutate the raw tree in place: only `media.heroVariants` changes, so the
  // staged file differs from the published one by exactly that field.
  const rawMedia = raw.media as Record<string, unknown>;
  rawMedia.heroVariants = variants;

  const validated = LandingFeedV2Schema.safeParse(raw);
  if (!validated.success) {
    fail(
      'the staged payload does not satisfy its schema:\n' +
        JSON.stringify(validated.error.format(), null, 2),
    );
  }

  mkdirSync(NEXT_DIR, { recursive: true });
  mkdirSync(ROLLBACK_DIR, { recursive: true });

  for (const file of PAYLOAD_FILES) {
    const source = path.join(FIXTURES_DIR, file);
    if (!existsSync(source)) {
      fail(`${file} is missing from fixtures/. Run \`npm run fixtures:fetch\` first.`);
    }
    copyFileSync(source, path.join(ROLLBACK_DIR, file));
    copyFileSync(source, path.join(NEXT_DIR, file));
  }

  // 2-space indent and a trailing newline match `fetch-fixtures.ts`, so a diff
  // against a re-downloaded payload is content-only.
  writeFileSync(
    path.join(NEXT_DIR, LANDING_FEED_FILE),
    `${JSON.stringify(raw, null, 2)}\n`,
    'utf8',
  );

  console.log('');
  console.log(`[stage-hero-variants] staged ${PAYLOAD_FILES.length} payload(s)`);
  console.log(`  next/      ${path.relative(REPO_ROOT, NEXT_DIR)}`);
  console.log(`  rollback/  ${path.relative(REPO_ROOT, ROLLBACK_DIR)}`);
  console.log('');
  console.log('Neither directory is committed. Publish with `npm run feed:publish -- --confirm`.');
}

main();
