/**
 * Convert and compress everything in `r2-cache/` into web-delivery formats.
 *
 * Runs as the first step of `npm run media:push`, so what gets uploaded is
 * always optimized. Run it on its own with:
 *
 *   npm run media:optimize
 *   npm run media:optimize -- --force        # re-encode even if already at target
 *   npm run media:optimize -- --upscale      # allow smaller sources to fill slots
 *   npm run media:optimize -- --crop=top     # crop from somewhere other than the centre
 *   npm run media:optimize -- --offline      # size from the role table, not the CDN
 *   npm run media:optimize -- --consume-sources # delete the original after converting
 *
 * The ergonomic contract: drop an image of **any size or shape** at the key you
 * want it published under, and the filename decides the output. A `-mobile`
 * suffix selects the mobile variant of the same slot, so the same 12-megapixel
 * photo can be dropped as both `hero.jpg` and `hero-mobile.jpg` and each is
 * produced at its own size.
 *
 * What it does:
 *   - raster sources (jpg, png, heic, tiff, gif) -> `.webp`
 *   - video sources (mov, mp4, m4v, avi, mkv)    -> `.webm` (VP9 + Opus)
 *   - every image is resized **and cropped** to fill its slot exactly
 *   - files already in a delivery format are measured too, so an oversized
 *     `.webp` dropped straight into the cache cannot pass through
 *   - animated GIF/WebP keep every frame across the resize
 *
 * Output size, in order of authority:
 *   1. the dimensions of the object already published at that key — what the
 *      layout is actually built around
 *   2. otherwise the role table in `lib/media.ts`, keyed off the filename
 *
 * A delivery-format file already at its exact target is left untouched rather
 * than re-encoded at the same quality: WebP is lossy, so a no-op re-encode would
 * compound generation loss on every run for no size win.
 *
 * Cropping discards real image area, and how much is reported on every file so
 * it shows up in the dry run. Upscaling is refused by default. Pass `--upscale`
 * when a smaller source must fill the slot anyway; the output will be softer.
 *
 * Converted sources are **kept** by default: the upload they feed cannot be
 * undone, so throwing away the original would make a bad crop unrecoverable.
 * They are never uploaded — only delivery formats are. Pass `--consume-sources`
 * to delete them once their output exists.
 *
 * `sharp` is used for images and is deliberately **not** declared in
 * `package.json`: `next` already ships it, and adding it as a direct dependency
 * rewrites ~14k lines of `package-lock.json` because the existing entry is
 * `optional`. It is resolved defensively below with an actionable message, and
 * nothing in `src/` depends on it, so a future `next` dropping it breaks this
 * script only — never a build or a deploy.
 */

import { Buffer } from 'node:buffer';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Sharp } from 'sharp';
import { resolveMediaUrl } from '../src/utils/mediaUrl';
import {
  byteBudgetFor,
  inferRole,
  needsExternalDecode,
  isAnimatedCapable,
  isDeliveryFormat,
  isReviewableImage,
  isReviewableVideo,
  isVideoSource,
  targetFor,
  toDeliveryKey,
} from './lib/media';

type SharpModule = (input: string | Buffer, options?: { animated?: boolean }) => Sharp;

async function loadSharp(): Promise<SharpModule> {
  try {
    return (await import('sharp')).default as unknown as SharpModule;
  } catch {
    console.error(
      '[media:optimize] `sharp` could not be resolved. It normally ships with `next`; ' +
        'install it explicitly with `npm i -D sharp` if that is no longer the case.',
    );
    process.exit(1);
  }
}

/** Assigned once in `main` before any encode runs. */
let sharp: SharpModule;

const CACHE_DIR = path.resolve(__dirname, '../r2-cache');

/** WebP quality. 80 lands within the size range of the already-published objects. */
const WEBP_QUALITY = 80;

/**
 * Floor for the byte-budget step-down. Below roughly 55 WebP starts showing
 * visible blocking on photographic detail, so a file that still will not fit is
 * reported rather than degraded further.
 */
const WEBP_QUALITY_FLOOR = 55;

const WEBP_QUALITY_STEP = 8;

/** Constant-quality VP9. 33 is visually clean for background video at this size. */
const VP9_CRF = 33;

/**
 * Enough of an image for `sharp` to read its header. Saves pulling multi-MB
 * objects over the wire just to learn their dimensions.
 */
const HEADER_BYTES = 65_536;

const force = process.argv.includes('--force');
const allowUpscale = process.argv.includes('--upscale');
/**
 * Proceed when the published object cannot be read, sizing from the role table
 * instead of the live dimensions.
 *
 * Named for what it does. It was `--allow-reframe` while a framing guard existed
 * to reject aspect-ratio changes; cropping is now the intended behaviour, so the
 * only thing left to opt into is working without the authoritative sizes.
 */
const offline = process.argv.includes('--offline');

/**
 * Where to crop from when a source is a different shape than its slot.
 *
 * `centre` is the default, deliberately, and **not** sharp's `attention`.
 * `attention` and `entropy` select the highest-contrast region, which in outdoor
 * photography is almost always the sky: cropping a 3024x4032 group portrait to a
 * 2.13:1 hero with `attention` produced a banner of clouds with the tops of two
 * helmets, while `centre` kept all five faces. Subjects sit in the middle of a
 * frame far more reliably than they are the most saturated thing in it.
 *
 * Override per run when the subject is off-centre:
 *
 *   --crop=centre|top|bottom|left|right|entropy|attention
 */
const CROP_POSITIONS = new Set([
  'centre',
  'center',
  'top',
  'bottom',
  'left',
  'right',
  'entropy',
  'attention',
]);

function resolveCropPosition(): string {
  const flag = process.argv.find((arg) => arg.startsWith('--crop='));
  if (!flag) return 'centre';

  const value = flag.slice('--crop='.length).toLowerCase();
  if (!CROP_POSITIONS.has(value)) {
    console.error(
      `[media:optimize] unknown --crop=${value}. ` +
        `Expected one of: ${Array.from(CROP_POSITIONS).sort().join(', ')}.`,
    );
    process.exit(1);
  }

  return value === 'center' ? 'centre' : value;
}

const cropPosition = resolveCropPosition();

/** Whether the caller asked for a specific crop, as opposed to taking the default. */
const cropRequested = process.argv.some((arg) => arg.startsWith('--crop='));

/**
 * Delete the original once its output exists.
 *
 * Opt-in, not default. Keeping `r2-cache/` a tidy mirror of the CDN is worth far
 * less than someone's only copy of a 12-megapixel original, and the upload it
 * feeds is already irreversible — R2 has no object versioning here, so a bad
 * crop plus a deleted source means the image cannot be recovered at all.
 *
 * `--keep-sources` is still accepted, and is now the default behaviour.
 */
const consumeSources = process.argv.includes('--consume-sources');

function walk(dir: string, prefix: string, into: string[]): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const key = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) walk(path.join(dir, entry.name), key, into);
    else into.push(key);
  }
}

function localPath(key: string): string {
  return path.join(CACHE_DIR, key);
}

/**
 * True when a converted output exists and is newer than the source it came from.
 *
 * An explicit `--crop` invalidates images: the requested geometry differs from
 * whatever produced the file on disk, and mtime cannot see that. Without this,
 * `--crop=top` on an already-converted tree silently did nothing. Video is
 * unaffected because it is never cropped.
 */
function isUpToDate(sourceKey: string, outputKey: string): boolean {
  if (force || sourceKey === outputKey) return false;
  if (cropRequested && !isReviewableVideo(sourceKey)) return false;

  const output = localPath(outputKey);
  if (!existsSync(output)) return false;

  return statSync(output).mtimeMs >= statSync(localPath(sourceKey)).mtimeMs;
}

/**
 * Dimensions of the object currently published at a key.
 *
 * The three outcomes are kept distinct on purpose. Collapsing `unavailable`
 * into `absent` would make an offline run look like a brand-new slot, silently
 * disabling both the framing guard and the published-width ceiling — exactly
 * when a reviewer is least likely to notice.
 */
type PublishedMeta =
  | { status: 'published'; width: number; height: number }
  | { status: 'absent' }
  | { status: 'unavailable'; reason: string };

async function publishedMeta(key: string): Promise<PublishedMeta> {
  const url = resolveMediaUrl(key);

  /** Returns the body, or a reason it could not be read. */
  async function read(range: boolean): Promise<{ body: Buffer } | { reason: string } | 'absent'> {
    try {
      const response = await fetch(
        url,
        range ? { headers: { Range: `bytes=0-${HEADER_BYTES - 1}` } } : undefined,
      );

      if (response.status === 404) return 'absent';

      // 206 for a served range, 200 when the origin ignores the Range header.
      if (response.status !== 200 && response.status !== 206) {
        return { reason: `HTTP ${response.status} ${response.statusText}` };
      }

      return { body: Buffer.from(await response.arrayBuffer()) };
    } catch (error) {
      return { reason: error instanceof Error ? error.message : String(error) };
    }
  }

  function dimensionsOf(body: Buffer): Promise<{ width?: number; height?: number }> {
    return sharp(body).metadata();
  }

  const ranged = await read(true);
  if (ranged === 'absent') return { status: 'absent' };

  if ('body' in ranged) {
    try {
      const meta = await dimensionsOf(ranged.body);
      if (meta.width && meta.height) {
        return { status: 'published', width: meta.width, height: meta.height };
      }
    } catch {
      // Falls through to the full read below. A truncated response is the
      // expected failure here: the container declares a length the slice does
      // not satisfy, so the decoder rejects it even though the header is
      // present. Only objects smaller than HEADER_BYTES parse from a range.
    }
  }

  const whole = await read(false);
  if (whole === 'absent') return { status: 'absent' };
  if ('reason' in whole) return { status: 'unavailable', reason: whole.reason };

  try {
    const meta = await dimensionsOf(whole.body);
    if (!meta.width || !meta.height) {
      return { status: 'unavailable', reason: 'published object has no readable dimensions' };
    }
    return { status: 'published', width: meta.width, height: meta.height };
  } catch (error) {
    return { status: 'unavailable', reason: error instanceof Error ? error.message : String(error) };
  }
}

type Result = { ok: true; changed: boolean; note: string } | { ok: false; reason: string };

/**
 * Share of the source frame discarded by a cover-crop to `target`.
 *
 * Cropping is intended here, but a very large number usually means the file
 * landed at the wrong key — a portrait phone photo at a 2.13:1 hero throws away
 * about two thirds of the image. Reported on every crop so that is visible in
 * the dry run rather than discovered on the site.
 */
function croppedAway(
  source: { width: number; height: number },
  target: { width: number; height: number },
): number {
  const scale = Math.max(target.width / source.width, target.height / source.height);
  const covered = (target.width / scale) * (target.height / scale);
  return 1 - covered / (source.width * source.height);
}

/**
 * Convert one image, isolating every failure to that file.
 *
 * A thrown encode used to escape all the way out of `main` and abort the run
 * with a raw stack trace: a single unreadable `.heic` left the other nineteen
 * files unprocessed and nothing uploaded. Anything that goes wrong here is now
 * one `✗` line among the results.
 */
async function optimizeImage(sourceKey: string, outputKey: string): Promise<Result> {
  let decoded: string | null = null;

  try {
    if (needsExternalDecode(sourceKey)) {
      const result = decodeToTemp(localPath(sourceKey));
      if (!result.ok) return { ok: false, reason: result.reason };
      decoded = result.path;
    }

    return await encodeImage(sourceKey, outputKey, decoded);
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error ? error.message.split('\n')[0] : String(error),
    };
  } finally {
    if (decoded && existsSync(decoded)) rmSync(decoded);
  }
}

/**
 * @param decodedPath pixels to read when the source format is not one `sharp`
 *   understands. Sizes are still reported against the original file, so the
 *   saving shown is the real one.
 */
async function encodeImage(
  sourceKey: string,
  outputKey: string,
  decodedPath: string | null,
): Promise<Result> {
  const source = decodedPath ?? localPath(sourceKey);
  const animated = decodedPath === null && isAnimatedCapable(sourceKey);
  const meta = await sharp(source, animated ? { animated: true } : undefined).metadata();

  if (!meta.width || !meta.height) return { ok: false, reason: 'could not read dimensions' };

  // `pageHeight` is set for multi-frame input; `height` is then every frame
  // stacked into one strip, which would make the geometry meaningless.
  const frameHeight = meta.pageHeight ?? meta.height;
  const frames = meta.pages ?? 1;
  const sourceSize = { width: meta.width, height: frameHeight };

  const published = await publishedMeta(outputKey);

  if (published.status === 'unavailable' && !offline) {
    return {
      ok: false,
      reason:
        `cannot read the published object to size against (${published.reason}). ` +
        'Retry with a working connection, or pass --offline to size from the role table ' +
        'in lib/media.ts instead.',
    };
  }

  // The published object's own dimensions win: they are what the layout renders.
  // The role table is the fallback for a key nothing exists at yet.
  const target =
    published.status === 'published'
      ? { width: published.width, height: published.height }
      : targetFor(inferRole(outputKey));

  // The original, never the temporary decode: a 2.5 MB HEIC reported against a
  // 19 MB intermediate PNG would show an invented saving.
  const before = statSync(localPath(sourceKey)).size;
  const alreadyDelivery = sourceKey === outputKey;

  // Upscaling invents detail and adds bytes, so refuse it unless the caller has
  // explicitly accepted that tradeoff for this upload.
  const isUpscaled = meta.width < target.width || frameHeight < target.height;
  if (isUpscaled && !allowUpscale) {
    return {
      ok: false,
      reason:
        `source is ${meta.width}x${frameHeight}, smaller than the ${target.width}x${target.height} ` +
        'this slot needs. Upscaling would add bytes and no detail — supply a larger source.',
    };
  }

  const discarded = croppedAway(sourceSize, target);
  const budget = byteBudgetFor(inferRole(outputKey));

  // A delivery file at its exact target *and* within budget needs nothing.
  // Re-encoding it at the same quality is a lossy round-trip that compounds on
  // every run.
  //
  // The budget has to be part of this test: checking dimensions alone let a
  // correctly-sized but far too heavy file through — a 716x955 tile at 133 KB
  // against a 90 KB budget reported "already at target" and was never touched,
  // which made the budget unenforceable for exactly the files most likely to
  // breach it.
  if (
    alreadyDelivery &&
    meta.width === target.width &&
    frameHeight === target.height &&
    before <= budget &&
    !force
  ) {
    return {
      ok: true,
      changed: false,
      note: `${meta.width}x${frameHeight}, ${Math.round(before / 1024)} KB — already at target`,
    };
  }

  /** Encode at a given quality. Geometry is identical across attempts. */
  const encode = (quality: number): Promise<Buffer> =>
    sharp(source, animated ? { animated: true } : undefined)
      // `cover` + a chosen position is what lets any source size land in any
      // slot: it scales to fill, then crops the overflow.
      .resize({
        width: target.width,
        height: target.height,
        fit: 'cover',
        position: cropPosition,
      })
      .webp({ quality, effort: 5 })
      .toBuffer();

  // Step quality down until the slot's byte budget is met. Stops at the floor
  // rather than degrading without limit — a file that cannot fit is reported
  // instead, because the right fix is usually a less noisy source.
  let quality = WEBP_QUALITY;
  let buffer = await encode(quality);

  while (buffer.byteLength > budget && quality > WEBP_QUALITY_FLOOR) {
    quality = Math.max(WEBP_QUALITY_FLOOR, quality - WEBP_QUALITY_STEP);
    buffer = await encode(quality);
  }

  if (alreadyDelivery && !force && !isUpscaled && buffer.byteLength >= before) {
    return {
      ok: true,
      changed: false,
      note: `${Math.round(before / 1024)} KB — re-encode was not smaller, kept original`,
    };
  }

  // Written as bytes, not re-encoded. Passing the buffer back through
  // `sharp().toFile()` would apply sharp's own default quality on the way out,
  // so the file on disk would not be the buffer the budget loop measured — and a
  // step-down to q72 could land a *larger* file than the q80 attempt.
  //
  // Buffering first is still required regardless: sharp cannot read and write
  // the same path, which is exactly the case when a delivery file is re-encoded
  // in place.
  mkdirSync(path.dirname(localPath(outputKey)), { recursive: true });
  writeFileSync(localPath(outputKey), buffer);

  const after = statSync(localPath(outputKey)).size;
  const saved = Math.round((1 - after / before) * 100);
  const frameNote = frames > 1 ? `, ${frames} frames` : '';
  const cropNote = discarded > 0.01 ? `, cropped ${Math.round(discarded * 100)}%` : '';
  const qualityNote = quality === WEBP_QUALITY ? '' : `, q${quality}`;
  const upscaleNote = isUpscaled ? ', upscaled' : '';
  const budgetNote =
    after > budget ? ` — OVER the ${Math.round(budget / 1024)} KB budget for this slot` : '';

  return {
    ok: true,
    changed: true,
    note:
      `${meta.width}x${frameHeight} -> ${target.width}x${target.height}${upscaleNote}${cropNote}${frameNote}, ` +
      `${Math.round(before / 1024)} KB -> ${Math.round(after / 1024)} KB (${saved}% smaller)` +
      `${qualityNote}${budgetNote}`,
  };
}

/**
 * Delete a source whose output is on disk, and report whether it went.
 *
 * `r2-cache/` mirrors the CDN, and only delivery formats are ever published, so
 * a `.jpg` that has already become a `.webp` is not part of the published set.
 * Never removes a file that *is* its own output — that is a delivery file
 * re-encoded in place — and never acts unless the output actually exists.
 */
function consumeSource(sourceKey: string, outputKey: string): boolean {
  if (!consumeSources || sourceKey === outputKey) return false;
  if (!existsSync(localPath(outputKey)) || !existsSync(localPath(sourceKey))) return false;

  rmSync(localPath(sourceKey));
  return true;
}

/**
 * Decode a format `sharp` cannot read into a temporary PNG it can.
 *
 * `ffmpeg` carries the HEVC decoder that the bundled libvips lacks, and it is
 * already required for video, so this adds no new tool. PNG is the intermediate
 * because it is lossless: the only lossy step stays the final WebP encode.
 *
 * The caller owns the returned path and must delete it.
 */
function decodeToTemp(sourcePath: string): { ok: true; path: string } | { ok: false; reason: string } {
  if (!hasFfmpeg()) {
    return {
      ok: false,
      reason:
        `${path.extname(sourcePath)} needs an external decoder — sharp's libvips ships HEIF for ` +
        'AVIF only. Install ffmpeg (brew install ffmpeg), or export the source as JPEG or PNG.',
    };
  }

  const target = path.join(
    tmpdir(),
    `andean-media-${process.pid}-${Date.now()}-${path.basename(sourcePath)}.png`,
  );

  try {
    execFileSync('ffmpeg', ['-y', '-i', sourcePath, target], { stdio: 'pipe' });
    return { ok: true, path: target };
  } catch (error) {
    if (existsSync(target)) rmSync(target);
    return {
      ok: false,
      reason: `could not decode with ffmpeg: ${
        error instanceof Error ? error.message.split('\n')[0] : String(error)
      }`,
    };
  }
}

function hasFfmpeg(): boolean {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function optimizeVideo(sourceKey: string, outputKey: string): Result {
  const source = localPath(sourceKey);
  const before = statSync(source).size;
  // Video is scaled to fit the slot width but never cropped: cropping a moving
  // subject blind is far riskier than the letterboxing a mismatched aspect
  // ratio produces, and the hero video sits behind a gradient anyway.
  const ceiling = targetFor(inferRole(outputKey)).width;
  const inPlace = sourceKey === outputKey;

  // Re-encoding VP9 into VP9 is a lossy round-trip that usually adds artefacts
  // without saving much, so it is opt-in.
  if (inPlace && !force) {
    return {
      ok: true,
      changed: false,
      note: `${Math.round(before / 1024)} KB — already a delivery format`,
    };
  }

  const destination = inPlace ? `${localPath(outputKey)}.tmp.webm` : localPath(outputKey);

  try {
    execFileSync(
      'ffmpeg',
      [
        '-y',
        '-i',
        source,
        // Even width is required by VP9; -2 keeps the aspect ratio and rounds.
        '-vf',
        `scale='min(${ceiling},iw)':-2`,
        '-c:v',
        'libvpx-vp9',
        '-crf',
        String(VP9_CRF),
        '-b:v',
        '0',
        '-row-mt',
        '1',
        '-c:a',
        'libopus',
        '-b:a',
        '96k',
        destination,
      ],
      { stdio: 'pipe' },
    );
  } catch (error) {
    if (inPlace && existsSync(destination)) rmSync(destination);
    return {
      ok: false,
      reason: error instanceof Error ? error.message.split('\n')[0] : String(error),
    };
  }

  if (inPlace) {
    // A forced re-encode that grew the file is not an improvement.
    if (statSync(destination).size >= before) {
      rmSync(destination);
      return {
        ok: true,
        changed: false,
        note: `${Math.round(before / 1024)} KB — re-encode was not smaller, kept original`,
      };
    }
    renameSync(destination, localPath(outputKey));
  }

  const after = statSync(localPath(outputKey)).size;

  return {
    ok: true,
    changed: true,
    note:
      `${Math.round(before / 1024)} KB -> ${Math.round(after / 1024)} KB ` +
      `(${Math.round((1 - after / before) * 100)}% smaller)`,
  };
}

async function main(): Promise<void> {
  if (!existsSync(CACHE_DIR)) {
    console.error('[media:optimize] r2-cache/ does not exist. Run `npm run media:pull` first.');
    process.exit(1);
  }

  sharp = await loadSharp();

  const keys: string[] = [];
  for (const top of ['images', 'videos']) {
    const dir = path.join(CACHE_DIR, top);
    if (existsSync(dir)) walk(dir, `/${top}`, keys);
  }

  const reviewable = keys.filter((key) => isReviewableImage(key) || isReviewableVideo(key)).sort();

  /**
   * Keys that a source file in this same run will produce.
   *
   * Without this, dropping `hero.jpg` next to the `hero.webp` it generates means
   * the generated file is then reviewed as an input of its own — a second lossy
   * encode of what was just written, in the same run. The source is
   * authoritative, so its output is skipped as an input.
   */
  const generated = new Set(
    reviewable.filter((key) => !isDeliveryFormat(key)).map((key) => toDeliveryKey(key)),
  );

  const work = reviewable.filter((key) => !(isDeliveryFormat(key) && generated.has(key)));

  if (work.length === 0) {
    console.log('[media:optimize] no images or videos found under r2-cache/.');
    return;
  }

  console.log(`[media:optimize] reviewing ${work.length} file(s) in r2-cache/`);
  if (force) console.log('[media:optimize] --force: re-encoding regardless of current state');
  if (offline) {
    console.log('[media:optimize] --offline: sizing from the role table, not the published objects');
  }
  if (allowUpscale) {
    console.log('[media:optimize] --upscale: smaller sources will be enlarged to fill their slots');
  }

  let converted = 0;
  let unchanged = 0;
  const failures: string[] = [];

  for (const sourceKey of work) {
    const outputKey = toDeliveryKey(sourceKey);

    if (isUpToDate(sourceKey, outputKey)) {
      // Already converted on an earlier run, so the source is redundant now.
      // Without this the original survives forever: the conversion path is the
      // only other place that removes it, and it does not run again.
      if (consumeSource(sourceKey, outputKey)) {
        console.log(`  = ${outputKey}  already converted, ${path.basename(sourceKey)} removed`);
      }
      unchanged += 1;
      continue;
    }

    if (isVideoSource(sourceKey) && !hasFfmpeg()) {
      const reason = 'ffmpeg is not installed (brew install ffmpeg)';
      failures.push(`${sourceKey}: ${reason}`);
      console.error(`  ✗ ${sourceKey}: ${reason}`);
      continue;
    }

    const result = isReviewableVideo(sourceKey)
      ? optimizeVideo(sourceKey, outputKey)
      : await optimizeImage(sourceKey, outputKey);

    if (!result.ok) {
      failures.push(`${sourceKey}: ${result.reason}`);
      console.error(`  ✗ ${sourceKey}\n      ${result.reason}`);
      continue;
    }

    if (!result.changed) {
      console.log(`  = ${outputKey}  ${result.note}`);
      unchanged += 1;
      continue;
    }

    const removed = consumeSource(sourceKey, outputKey);

    const from = isDeliveryFormat(sourceKey)
      ? ''
      : ` (from ${path.extname(sourceKey)}${removed ? ', source removed' : ''})`;
    console.log(`  ✓ ${outputKey}${from}  ${result.note}`);
    converted += 1;
  }

  console.log(`[media:optimize] ${converted} written, ${unchanged} already optimal`);

  if (failures.length > 0) {
    console.error(
      `[media:optimize] FAILED — ${failures.length} file(s) need attention. Nothing was uploaded.`,
    );
    process.exit(1);
  }
}

main();
