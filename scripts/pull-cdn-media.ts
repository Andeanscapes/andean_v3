/**
 * Download the CDN media objects the feed references into the gitignored
 * `r2-cache/` directory.
 *
 * The media is real business content served from Cloudflare R2 behind
 * `cdn.andeanscapes.com`, so it is deliberately **not committed**. This gives a
 * local mirror of what is published, for offline work and for inspecting what
 * the feed actually points at.
 *
 * Run it with:
 *   npm run media:pull
 *
 * The object list is **derived, never hardcoded**: every `/images/...` and
 * `/videos/...` string in `fixtures/` (what is published) and
 * `feed-migration/next/` (what is staged) is pulled, so publishing new media
 * needs no change here. Neither directory is refreshed by this script — run
 * `npm run fixtures:fetch` if they are stale.
 *
 * Behaviour on failure is deliberate:
 *   - a referenced object 404s      -> exit 1. The feed points at media that is
 *                                     not published; that is a content bug.
 *   - the network/CDN is unreachable-> exit 1, with the copies already on disk
 *                                     left untouched.
 *   - a derived `-mobile` sibling   -> reported, never fatal. The convention
 *     404s                            applies to hero and card images, not to
 *                                     gallery frames, so absence is expected.
 */

import { Buffer } from 'node:buffer';
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { resolveMediaUrl } from '../src/utils/mediaUrl';
import { getResponsiveImageSrc, hasImageExtension } from '../src/utils/responsiveImage';
import { downloadFromOrigin, readLength } from './lib/cdn';
import { readReferencedMedia } from './lib/feed-media';
import { IMAGE_SOURCE_EXTENSIONS, VIDEO_SOURCE_EXTENSIONS } from './lib/media';

const CACHE_DIR = path.resolve(__dirname, '../r2-cache');

type PullOutcome = 'downloaded' | 'cached' | 'missing' | 'failed' | 'local-source';

/**
 * Absolute path under `r2-cache/` for a CDN key, or `null` if it escapes.
 *
 * `MediaPathSchema` rejects `..` at the feed boundary, but this script never
 * parses the payloads it reads — `readReferencedMedia` collects any string that
 * starts with `/images/` or `/videos/` from whatever JSON sits in `fixtures/`.
 * A key like `/images/../../x` would therefore resolve outside the cache and
 * `writeFileSync` would put a downloaded body there. Resolve first, then assert
 * containment, so the check cannot be fooled by encoding or by a `.` segment.
 */
function cachePathFor(mediaPath: string): string | null {
  const resolved = path.resolve(CACHE_DIR, `.${mediaPath}`);
  return resolved.startsWith(`${CACHE_DIR}${path.sep}`) ? resolved : null;
}

/**
 * A local source file that would produce this key, if one exists.
 *
 * Overwriting an output while its source sits next to it un-pushed makes the
 * output newer than the source, and `media:optimize` then treats the conversion
 * as already applied — silently discarding pending work. The source is
 * authoritative, so the download is skipped instead.
 */
function localSourceFor(key: string): string | null {
  const extension = path.extname(key);
  const base = key.slice(0, key.length - extension.length);
  const candidates =
    extension === '.webm' ? VIDEO_SOURCE_EXTENSIONS : IMAGE_SOURCE_EXTENSIONS;

  for (const candidate of Array.from(candidates)) {
    if (existsSync(path.join(CACHE_DIR, `${base}${candidate}`))) return `${base}${candidate}`;
  }

  return null;
}

/**
 * Fetch one object and write it under `r2-cache/`, skipping the download when
 * the local copy already matches the published `content-length`.
 *
 * A 404 is returned as `missing` rather than thrown: the caller decides whether
 * a given key is required (feed-referenced) or optional (a derived sibling).
 */
async function pull(mediaPath: string): Promise<PullOutcome> {
  // Before any filesystem touch, including the source probe below.
  const localPath = cachePathFor(mediaPath);
  if (!localPath) {
    console.error(`  ✗ ${mediaPath}: resolves outside r2-cache/ — refusing to read or write`);
    return 'failed';
  }

  const url = resolveMediaUrl(mediaPath);

  const source = localSourceFor(mediaPath);
  if (source) {
    console.log(`  ~ ${mediaPath} — kept, ${path.basename(source)} is staged to replace it`);
    return 'local-source';
  }

  // Origin, not edge. A HEAD reports what R2 holds while a GET on the same URL
  // can still serve the pre-upload bytes, so sizing with one and downloading
  // with the other wrote stale content into the cache under a fresh size — and
  // `media:push` then treats this directory as truth.
  const published = await readLength(url, true);

  if (published.status === 'absent') return 'missing';

  if (published.status === 'unavailable') {
    console.error(`  ✗ ${mediaPath}: ${published.reason}`);
    return 'failed';
  }

  // Size is the only comparable the CDN exposes cheaply: R2 returns a
  // multipart-style ETag for larger objects, so it cannot be recomputed from
  // the bytes on disk to compare against.
  if (existsSync(localPath) && statSync(localPath).size === published.length) {
    return 'cached';
  }

  const download = await downloadFromOrigin(url);
  if (!download.ok) {
    console.error(`  ✗ ${mediaPath}: ${download.reason}`);
    return 'failed';
  }

  // Belt and braces: if the body still does not match what origin just reported,
  // something served a cached copy anyway. Writing it would corrupt the mirror
  // silently, so refuse rather than guess.
  if (download.body.byteLength !== published.length) {
    console.error(
      `  ✗ ${mediaPath}: origin reported ${published.length} bytes but returned ` +
        `${download.body.byteLength} — refusing to cache a mismatched copy`,
    );
    return 'failed';
  }

  mkdirSync(path.dirname(localPath), { recursive: true });
  writeFileSync(localPath, Buffer.from(download.body));
  return 'downloaded';
}


async function main(): Promise<void> {
  const { keys: referenced, fileCount, sources } = readReferencedMedia();

  // No local feed copies at all is a setup problem, not an empty publish.
  if (fileCount === 0) {
    console.error(
      '[media:pull] no feed payloads found in fixtures/ or feed-migration/next/. ' +
        'Run `npm run fixtures:fetch` first — this script mirrors what the feed ' +
        'references, it does not discover objects on its own.',
    );
    process.exit(1);
  }

  // A published feed that carries no `media`, with nothing staged either. The
  // landing structure still points at source-controlled `/assets/...`
  // fallbacks, which ship with the app and so need no mirror.
  if (referenced.size === 0) {
    console.log(
      `[media:pull] ${fileCount} feed payload(s) reference no CDN media — nothing to mirror. ` +
        'Run `npm run fixtures:fetch` if the published feed has since gained a `media` block.',
    );
    return;
  }

  // The media components request a `-mobile` sibling for responsive art
  // direction, so a faithful mirror includes them. Derived with the same helper
  // the components use rather than by string concatenation here.
  const siblings = new Set<string>();
  for (const mediaPath of Array.from(referenced)) {
    if (!hasImageExtension(mediaPath)) continue;
    const { mobile } = getResponsiveImageSrc(mediaPath);
    if (!referenced.has(mobile)) siblings.add(mobile);
  }

  // Derived from the resolver rather than re-reading the env var, so the banner
  // can never disagree with the URLs actually fetched.
  const cdnBase = resolveMediaUrl('/images/').slice(0, -'/images/'.length);

  console.log(`[media:pull] ${cdnBase} -> r2-cache/  (from ${sources.join(' + ')})`);
  console.log(
    `[media:pull] ${referenced.size} object(s) referenced, ` +
      `${siblings.size} derived -mobile sibling(s)`,
  );

  mkdirSync(CACHE_DIR, { recursive: true });

  let downloaded = 0;
  let cached = 0;
  let failed = 0;
  let keptForSource = 0;
  const missingRequired: string[] = [];
  const missingOptional: string[] = [];

  for (const mediaPath of Array.from(referenced).sort()) {
    const outcome = await pull(mediaPath);
    if (outcome === 'downloaded') {
      console.log(`  ✓ ${mediaPath}`);
      downloaded += 1;
    } else if (outcome === 'cached') {
      cached += 1;
    } else if (outcome === 'local-source') {
      keptForSource += 1;
    } else if (outcome === 'missing') {
      console.error(`  ✗ ${mediaPath}: 404 — referenced by the feed but not published`);
      missingRequired.push(mediaPath);
    } else {
      failed += 1;
    }
  }

  for (const mediaPath of Array.from(siblings).sort()) {
    const outcome = await pull(mediaPath);
    if (outcome === 'downloaded') {
      console.log(`  ✓ ${mediaPath}`);
      downloaded += 1;
    } else if (outcome === 'cached') {
      cached += 1;
    } else if (outcome === 'local-source') {
      keptForSource += 1;
    } else if (outcome === 'missing') {
      missingOptional.push(mediaPath);
    } else {
      failed += 1;
    }
  }

  const keptNote = keptForSource > 0 ? `, ${keptForSource} kept for a staged source` : '';
  console.log(`[media:pull] ${downloaded} downloaded, ${cached} cached${keptNote}`);

  if (missingOptional.length > 0) {
    console.log(
      `[media:pull] ${missingOptional.length} object(s) have no -mobile variant published: ` +
        `${missingOptional.join(', ')}`,
    );
  }

  if (missingRequired.length > 0 || failed > 0) {
    console.error(
      `[media:pull] FAILED — ${missingRequired.length} referenced object(s) missing, ` +
        `${failed} read error(s).`,
    );
    process.exit(1);
  }
}

main();
