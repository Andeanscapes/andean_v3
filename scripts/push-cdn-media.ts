/**
 * Upload the media in the gitignored `r2-cache/` directory to the Cloudflare R2
 * bucket behind `cdn.andeanscapes.com`.
 *
 * The counterpart of `npm run media:pull`. Together they give a two-way mirror:
 *   pull  CDN      -> r2-cache/
 *   push  r2-cache/ -> CDN
 *
 * Run it with:
 *   npm run media:push             # optimize, then upload what differs
 *   npm run media:push -- --dry-run # print the plan, upload nothing
 *   npm run media:sync             # the above, allowing undersized sources and
 *                                  # removing originals once their output uploads
 *
 * `media:optimize` runs first, invoked from here rather than chained in the npm
 * script so that flags reach it: `media:push -- --force` forwards `--force` to
 * the optimizer. Anything dropped into `r2-cache/` is therefore converted and
 * measured against its slot before it is considered here. Only delivery formats
 * are uploaded.
 *
 * **This uploads without further confirmation**, by request: the flow is meant to
 * be one command. That is safe enough only because of what surrounds it — the
 * plan is printed before any upload, the optimizer fails closed, and
 * `assertReferenced` blocks a key the feed does not reference. What is *not*
 * recoverable is the overwrite itself: R2 object versioning is not enabled on
 * the bucket, so the previous bytes are gone. `npm run media:pull` before editing
 * is the only undo. Use `--dry-run` when unsure.
 *
 * `wrangler r2 object` has no `list` subcommand and the S3-compatible listing
 * API needs SigV4 with a separate R2 access key pair, so the diff is taken
 * against the public CDN with a HEAD per object. That is a cache-fronted read:
 * an object deleted or replaced in the last few minutes may still answer with
 * its previous size, so a needed upload can be reported as `up to date`. Pass
 * `--force` to upload every local file regardless of the diff.
 *
 * Uploads go through the `wrangler` CLI rather than a raw HTTP call so the
 * existing `.env.wrangler` credentials and the `--remote` guard are reused
 * instead of reimplemented.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import { FOOTER_TRUST_GALLERY } from '../src/constant/SiteConfig';
import { resolveMediaUrl } from '../src/utils/mediaUrl';
import { getResponsiveImageSrc, hasImageExtension } from '../src/utils/responsiveImage';
import { purgeCache, readLength } from './lib/cdn';
import {
  isHeroVariantKey,
  nearestKey,
  readReferencedMedia,
  withResponsiveSiblings,
} from './lib/feed-media';
import {
  CONTENT_TYPES as MEDIA_CONTENT_TYPES,
  isImageSource,
  isVideoSource,
  selectPrunableSources,
  toDeliveryKey,
} from './lib/media';

/** Kept in one place so it cannot drift from the `media:optimize` npm script. */
const OPTIMIZE_COMMAND = [
  'vite-node',
  '-c',
  'vitest.config.ts',
  'scripts/optimize-media.ts',
] as const;

const CACHE_DIR = path.resolve(__dirname, '../r2-cache');

/**
 * CDN keys the app reads directly rather than through the feed.
 *
 * Imported from the same constant the component renders, so this cannot drift:
 * adding a footer tile in `SiteConfig` makes it publishable here automatically.
 */
const APP_OWNED_MEDIA: readonly string[] = FOOTER_TRUST_GALLERY;

/**
 * Target bucket. Configuration, not a credential — `wrangler.toml` declares no
 * R2 binding, so there is no existing source of truth to read this from.
 * Override with `R2_BUCKET` to push to a different environment's bucket.
 */
const BUCKET = process.env.R2_BUCKET?.trim() || 'andean-app-dev';

/**
 * Only delivery formats are uploaded. A `.jpg` or `.mov` left in `r2-cache/` is
 * the *source* that `media:optimize` converted; publishing it too would ship an
 * unoptimized duplicate of an object that is already there as `.webp`/`.webm`.
 */
const CONTENT_TYPES = MEDIA_CONTENT_TYPES;

// Accepts `--confirm` as a no-op: it was required until the flow was made
// single-command, and muscle memory should not error.
const dryRun = process.argv.includes('--dry-run');
const forced = process.argv.includes('--force');
const allowOrphan = process.argv.includes('--allow-orphan');
/**
 * Delete each converted original once its output is confirmed published.
 *
 * Explicitly opt-in: upload success cannot confirm that an automatic crop is
 * visually correct, and the original may be the only recoverable copy. It is
 * **not** the optimizer's `--consume-sources`: that deletes at conversion
 * time, before the upload it feeds, which makes a failed or badly cropped upload
 * unrecoverable. This runs after the upload and only for keys the CDN confirms.
 */
const pruneSources = process.argv.includes('--prune-sources');

/** Recursively collect files under `r2-cache/` matching `accept`, as CDN-relative keys. */
function collectLocalMedia(
  dir: string,
  prefix: string,
  into: string[],
  accept: (key: string) => boolean,
): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    const key = `${prefix}/${entry.name}`;

    if (entry.isDirectory()) {
      collectLocalMedia(absolute, key, into, accept);
      continue;
    }
    if (accept(key)) into.push(key);
  }
}

/** Only delivery formats are uploaded; everything else in the cache is a source. */
function isUploadable(key: string): boolean {
  return Boolean(CONTENT_TYPES[path.extname(key).toLowerCase()]);
}

function collectUnder(accept: (key: string) => boolean): string[] {
  const keys: string[] = [];

  for (const top of ['images', 'videos']) {
    const dir = path.join(CACHE_DIR, top);
    if (existsSync(dir)) collectLocalMedia(dir, `/${top}`, keys, accept);
  }

  return keys;
}

type Verdict = 'new' | 'changed' | 'current' | 'unreachable';

/**
 * Compare one local file against what **R2** holds.
 *
 * Origin, not edge: the upload decision is about the bucket. Asking the edge
 * would mean re-uploading on every run for as long as a stale cache entry lived,
 * since uploading to R2 does not invalidate it.
 */
async function classify(key: string, localSize: number): Promise<Verdict> {
  if (forced) return 'changed';

  const published = await readLength(resolveMediaUrl(key), true);

  if (published.status === 'absent') return 'new';
  if (published.status === 'unavailable') return 'unreachable';

  return published.length === localSize ? 'current' : 'changed';
}

/**
 * Keys whose edge copy still differs from the local file.
 *
 * Separate from `classify` because they answer different questions: R2 can hold
 * the new object while the CDN serves the old one for the rest of its TTL. Not
 * reporting this is what made an upload look successful while the site was
 * unchanged — and what made "20 already up to date" true of the bucket and false
 * of every visitor.
 */
async function findStaleAtEdge(keys: readonly string[]): Promise<string[]> {
  const stale: string[] = [];

  for (const key of keys) {
    const localSize = statSync(path.join(CACHE_DIR, key)).size;
    const edge = await readLength(resolveMediaUrl(key), false);

    if (edge.status === 'found' && edge.length !== localSize) stale.push(key);
  }

  return stale;
}

/**
 * Invalidate the edge, and say plainly what to do when that is not permitted.
 *
 * The deploy token in `.env.wrangler` often carries only Zone:Read, so this is
 * best effort: an upload that succeeded must not be reported as a failure because
 * the cache could not be flushed.
 */
async function invalidate(keys: readonly string[]): Promise<void> {
  if (keys.length === 0) return;

  const urls = keys.map((key) => resolveMediaUrl(key));
  const result = await purgeCache(urls);

  if (result.ok) {
    console.log(`[media:push] purged ${result.count} URL(s) from the CDN cache`);
    return;
  }

  console.warn(
    `[media:push] could not purge the CDN cache: ${result.reason}\n` +
      '[media:push] the upload succeeded, but visitors keep the previous image until the\n' +
      '[media:push] cache expires. Set CLOUDFLARE_ZONE_ID in .env.wrangler and grant the\n' +
      '[media:push] token `Zone · Cache Purge · Purge` on that zone, or purge these URLs\n' +
      '[media:push] by hand (Caching -> Configuration -> Purge Custom URL):',
  );
  for (const url of result.manual) console.warn(`    ${url}`);
}

function upload(key: string, localPath: string): void {
  // `--remote` is not optional: without it wrangler writes to the local
  // Miniflare bucket under .wrangler/ and still reports success.
  execFileSync(
    'npx',
    [
      // Never resolve a missing binary from the registry: this step runs with
      // the R2 credentials loaded, so an unpinned fetch here is the worst place
      // to accept one. Absent locally must fail, not install.
      '--no-install',
      'dotenv',
      '-e',
      '.env.wrangler',
      '--',
      'wrangler',
      'r2',
      'object',
      'put',
      `${BUCKET}${key}`,
      '--file',
      localPath,
      '--content-type',
      CONTENT_TYPES[path.extname(key).toLowerCase()],
      '--remote',
    ],
    { cwd: path.resolve(__dirname, '..'), stdio: 'pipe' },
  );
}

/**
 * Flags that belong to the optimizer rather than the upload.
 *
 * Matched by prefix so `--crop=top` forwards its value. Missing that made
 * `media:push -- --crop=top` silently apply the default crop with no error.
 */
const OPTIMIZE_FLAGS = [
  '--force',
  '--upscale',
  '--offline',
  '--crop=',
  '--keep-sources',
  '--consume-sources',
] as const;

/**
 * Run the optimizer as a child process, forwarding the flags it understands.
 *
 * A non-zero exit means a file needs attention — unless `--upscale` explicitly
 * allows a smaller source — and the upload must not proceed with a half-optimized tree.
 */
function runOptimize(): void {
  const forwarded = process.argv.filter((arg) =>
    OPTIMIZE_FLAGS.some((flag) => (flag.endsWith('=') ? arg.startsWith(flag) : arg === flag)),
  );

  try {
    execFileSync('npx', ['--no-install', ...OPTIMIZE_COMMAND, ...forwarded], {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit',
    });
  } catch {
    console.error('[media:push] optimization failed — nothing was uploaded.');
    process.exit(1);
  }
}

/**
 * Refuse keys nothing reads.
 *
 * Cropping now succeeds for any input shape, so a mistyped filename no longer
 * fails on framing — it would convert cleanly and publish an object nothing
 * reads. This is the check that catches it, so what counts as "read" has to
 * cover both owners of media:
 *
 *   the feed            business media, the single source of truth for content
 *   `SiteConfig`        brand chrome the app owns, e.g. the footer trust tiles
 *   hero convention     `landing-hero-<n>.webp`, publishable before the feed
 *                       change that references it
 *
 * Neither addition is optional. The footer keys are deliberately absent from the
 * feed — the footer renders in the layout on every route and no page may fetch a
 * second feed resource. And a file following the hero convention is self-evidently
 * a future hero, so rejecting it taught the operator to reach for
 * `--allow-orphan`, which disables this check for *everything* — the opposite of
 * what a guard should encourage.
 *
 * What still fails is the case this exists for: a typo. `landing-heor-04.webp`
 * matches no convention and is refused with the intended name suggested.
 *
 * `--allow-orphan` remains for other media staged ahead of its feed change.
 */
function assertReferenced(keys: readonly string[]): void {
  if (allowOrphan) return;

  const { keys: referenced, fileCount } = readReferencedMedia();

  // With no local payloads there is nothing to check against; `media:pull` already
  // fails loudly for that, so do not block an upload on it here.
  if (fileCount === 0) return;

  for (const key of APP_OWNED_MEDIA) referenced.add(key);

  const allowed = withResponsiveSiblings(referenced, (key) =>
    hasImageExtension(key) ? getResponsiveImageSrc(key).mobile : null,
  );

  const allowedList = Array.from(allowed);
  const orphans = keys.filter((key) => !allowed.has(key) && !isHeroVariantKey(key));

  if (orphans.length === 0) return;

  console.error('[media:push] these keys are read by neither the feed nor the app:');
  for (const key of orphans) {
    const suggestion = nearestKey(key, allowedList);
    console.error(`  ✗ ${key}${suggestion ? `\n      did you mean ${suggestion} ?` : ''}`);
  }
  console.error(
    '[media:push] nothing was uploaded. Rename the file, or pass --allow-orphan if the ' +
      'feed change that references it is still to come.',
  );
  process.exit(1);
}

async function main(): Promise<void> {
  if (!existsSync(CACHE_DIR)) {
    console.error('[media:push] r2-cache/ does not exist. Run `npm run media:pull` first.');
    process.exit(1);
  }

  runOptimize();

  const keys = collectUnder(isUploadable);

  if (keys.length === 0) {
    console.log('[media:push] r2-cache/ holds no media under images/ or videos/ — nothing to push.');
    return;
  }

  keys.sort();
  assertReferenced(keys);

  console.log(`[media:push] r2-cache/ -> ${BUCKET} (${keys.length} local file(s))`);
  if (forced) console.log('[media:push] --force: skipping the diff, every file will be uploaded.');
  if (allowOrphan) console.log('[media:push] --allow-orphan: publishing keys the feed does not reference.');
  if (pruneSources) {
    console.log('[media:push] --prune-sources: converted originals are removed once published.');
  }

  const pending: string[] = [];
  // Keys the CDN already holds at the local size. Tracked as keys rather than a
  // count because pruning has to know *which* outputs are published before it
  // may delete the originals they came from.
  const published: string[] = [];
  let unreachable = 0;
  // Outputs whose original is still on disk. With --prune-sources they are
  // uploaded even when the diff calls them current: pruning trusts only this
  // run's uploads, and a size match cannot prove the published bytes are these.
  const withSource = pruneSources
    ? new Set(collectUnder((key) => isImageSource(key) || isVideoSource(key)).map(toDeliveryKey))
    : new Set<string>();

  for (const key of keys) {
    const localPath = path.join(CACHE_DIR, key);

    if (withSource.has(key)) {
      console.log(`  ~ ${key} (re-uploaded so its original can be removed)`);
      pending.push(key);
      continue;
    }

    const verdict = await classify(key, statSync(localPath).size);

    if (verdict === 'current') {
      published.push(key);
    } else if (verdict === 'unreachable') {
      console.error(`  ✗ ${key}: could not read the published object to compare`);
      unreachable += 1;
    } else {
      console.log(`  ${verdict === 'new' ? '+' : '~'} ${key}${verdict === 'new' ? '' : ' (differs)'}`);
      pending.push(key);
    }
  }

  // A failed comparison must not be mistaken for "nothing to do": exit before
  // uploading a partial set the caller has not seen a complete plan for.
  if (unreachable > 0) {
    console.error(
      `[media:push] FAILED — ${unreachable} object(s) could not be compared. ` +
        'Nothing was uploaded; check the network, or pass --force to skip the diff.',
    );
    process.exit(1);
  }

  if (pending.length === 0) {
    console.log(`[media:push] ${published.length} file(s) already up to date — nothing to push.`);
    // "Up to date" is a statement about R2. The edge can still be serving the
    // previous bytes, which is the case an earlier version reported as success.
    await reportEdgeStaleness(keys);
    // Nothing was uploaded, so nothing may be pruned — see the note at the call
    // site below. A source left on disk costs space; deleting it can cost the file.
    return;
  }

  if (dryRun) {
    console.log(
      `[media:push] DRY RUN — ${pending.length} file(s) would be uploaded, ` +
        `${published.length} already up to date.\n` +
        '[media:push] Re-run without --dry-run to upload.',
    );
    await reportEdgeStaleness(keys);
    pruneConvertedSources(pending);
    return;
  }

  let uploaded = 0;
  let failed = 0;
  const succeeded: string[] = [];

  for (const key of pending) {
    try {
      upload(key, path.join(CACHE_DIR, key));
      console.log(`  ✓ ${key}`);
      succeeded.push(key);
      uploaded += 1;
    } catch (error) {
      console.error(`  ✗ ${key}: ${error instanceof Error ? error.message : String(error)}`);
      failed += 1;
    }
  }

  console.log(`[media:push] ${uploaded} uploaded, ${published.length} unchanged, ${failed} failed`);

  await invalidate(succeeded);
  await reportEdgeStaleness(keys);
  // Only this run's uploads. `published` is decided by `classify`, which compares
  // `content-length` alone: a replaced source whose output happens to match the
  // old byte length is reported `current`, never uploaded, and pruning on that
  // basis would delete the only full-resolution copy while the CDN still serves
  // the previous bytes. R2 has no object versioning, so that is unrecoverable.
  pruneConvertedSources(succeeded);
  reportHeroFollowUp(succeeded);

  if (failed > 0) process.exit(1);
}

/**
 * Remove each converted original whose output is published.
 *
 * Runs after the upload, never before it, and only for keys **this run
 * uploaded**. The original is the only full-resolution copy and the bucket has
 * no object versioning, so deleting it ahead of a confirmed publish would make a
 * failed upload — or a bad crop — unrecoverable. A source whose delivery key is
 * not in `publishedKeys` therefore stays on disk, which is exactly the file a
 * retry needs.
 *
 * Keys the diff merely reported as `current` are excluded on purpose: that
 * verdict comes from a `content-length` comparison, which cannot tell a matching
 * file from a different one of the same size.
 *
 * Delivery formats are never touched: they *are* the published objects, and
 * `r2-cache/` is their local mirror.
 */
function pruneConvertedSources(publishedKeys: readonly string[]): void {
  if (!pruneSources) return;

  const sources = collectUnder((key) => isImageSource(key) || isVideoSource(key));
  const prunable = selectPrunableSources(sources, new Set(publishedKeys)).sort();

  if (prunable.length === 0) return;

  if (dryRun) {
    console.log(`[media:push] DRY RUN — ${prunable.length} converted source(s) would be removed:`);
    for (const key of prunable) console.log(`    - ${key}`);
    return;
  }

  let removed = 0;
  for (const key of prunable) {
    try {
      rmSync(path.join(CACHE_DIR, key));
      console.log(`  - ${key} (published as ${path.basename(toDeliveryKey(key))}, source removed)`);
      removed += 1;
    } catch (error) {
      // Never fatal: the upload already succeeded, and a file that could not be
      // deleted costs disk space rather than correctness.
      console.warn(
        `[media:push] could not remove ${key}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  console.log(`[media:push] removed ${removed} converted source file(s) from r2-cache/`);
}

/**
 * Name the remaining step after a hero upload.
 *
 * Uploading the object is only half of it: the site renders what the feed lists,
 * so a new hero sits inert in R2 until the pool is republished. That gap is the
 * single most confusing thing about this pipeline — the upload reports success
 * and the page does not change — so the commands that finish the job are printed
 * rather than left to memory or documentation.
 */
function reportHeroFollowUp(uploaded: readonly string[]): void {
  if (!uploaded.some(isHeroVariantKey)) return;

  console.log('');
  console.log('[media:push] a landing hero changed. The site renders what the feed lists, so');
  console.log('[media:push] the pool has to be republished before the new image appears:');
  console.log('');
  console.log('    npm run fixtures:fetch');
  console.log('    npm run feed:stage-hero-variants');
  console.log('    npm run feed:publish -- --confirm');
}

/**
 * Warn about any key a visitor would still receive the old version of.
 *
 * Runs over every local file, not only the uploads: an object published on an
 * earlier run can still be cached, which is exactly the state that made a
 * "nothing to push" run look like nothing was wrong.
 */
async function reportEdgeStaleness(keys: readonly string[]): Promise<void> {
  const stale = await findStaleAtEdge(keys);
  if (stale.length === 0) return;

  console.warn(
    `[media:push] ${stale.length} object(s) are correct in R2 but still cached at the edge — ` +
      'visitors see the previous version:',
  );
  for (const key of stale) console.warn(`    ${resolveMediaUrl(key)}`);
}

main();
