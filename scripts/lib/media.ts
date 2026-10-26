/**
 * Shared media conventions for the `media:*` scripts.
 *
 * The size ceilings are not invented: they are the dimensions of the objects
 * already published to R2, measured with `sharp`. They are only a *fallback*,
 * though — when a key is already published, `optimize-media.ts` caps against the
 * published width instead, which is authoritative. The table below is what a
 * brand-new key gets, where there is nothing to measure.
 *
 *   HERO      1600w desktop / 800w `-mobile`   full-bleed `<picture>`
 *   CARD      1200w desktop / 400w `-mobile`   gallery frames, category tiles
 *   PORTRAIT   716w desktop / 370w `-mobile`   the 3:4 card crop
 *   ICON       150w                            avatars and tier thumbnails
 */

import path from 'node:path';

/**
 * Formats the CDN serves. Only these are uploaded.
 *
 * AVIF is delivery, not a source: it generally out-compresses WebP, so
 * converting it would cost bytes for no gain.
 */
export const DELIVERY_EXTENSIONS = new Set(['.webp', '.avif', '.webm', '.svg']);

/** Raster sources converted to `.webp`. */
export const IMAGE_SOURCE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.tif',
  '.tiff',
  '.heic',
  '.heif',
  '.gif',
]);

/** Video sources converted to `.webm`. */
export const VIDEO_SOURCE_EXTENSIONS = new Set(['.mov', '.mp4', '.m4v', '.avi', '.mkv']);

/**
 * Every raster image the optimizer inspects, including the delivery formats.
 *
 * Delivery formats have to be in here or an oversized `.webp` dropped straight
 * into the cache would never be measured against its slot and would ship at
 * whatever resolution it happened to have.
 */
export const REVIEWABLE_IMAGE_EXTENSIONS = new Set([
  ...Array.from(IMAGE_SOURCE_EXTENSIONS),
  '.webp',
  '.avif',
]);

/** Every video the optimizer inspects, including the delivery format. */
export const REVIEWABLE_VIDEO_EXTENSIONS = new Set([
  ...Array.from(VIDEO_SOURCE_EXTENSIONS),
  '.webm',
]);

/** Formats whose frames must be preserved through a resize. */
export const ANIMATED_CAPABLE_EXTENSIONS = new Set(['.gif', '.webp']);

/**
 * Formats `sharp` cannot decode and that must be converted by an external tool
 * first.
 *
 * The prebuilt libvips registers HEIF for **AVIF only** — `sharp.format.heif`
 * reports `fileSuffix: ['.avif']` — because the HEVC decoder HEIC needs is
 * patent-encumbered and left out. A `.heic` straight from an iPhone therefore
 * opens as a valid container and then fails mid-stream with "Decoder plugin
 * generated an error", which is not a diagnosis anyone should have to make
 * twice.
 */
export const EXTERNAL_DECODE_EXTENSIONS = new Set(['.heic', '.heif']);

export function needsExternalDecode(key: string): boolean {
  return EXTERNAL_DECODE_EXTENSIONS.has(extensionOf(key));
}

export const CONTENT_TYPES: Readonly<Record<string, string>> = {
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.webm': 'video/webm',
  '.svg': 'image/svg+xml',
};

/**
 * Exact output size per slot, measured from the objects published to R2.
 *
 * Both dimensions matter: an image is resized **and cropped** to fill its slot,
 * so the aspect ratio here is what decides the framing. These are only the
 * fallback for a key nothing is published under — when the key already exists,
 * `optimize-media.ts` targets the published object's own dimensions, which are
 * authoritative.
 *
 * Measured values behind each entry:
 *   hero            landing 1600x751, experience/list 1600x758
 *   heroMobile      experience/list 824x391, landing 800x375
 *   tile            gallery + landscape categories 1200x563..570
 *   portrait        card and the 3:4 category crop 716x955
 *   portraitMobile  card-mobile 370x494
 *   icon            host-avatar, tier thumbnails 150x150
 *   thumbGallery    footer gallery tiles 300x300
 */
const TARGET = {
  hero: { width: 1600, height: 751 },
  heroMobile: { width: 824, height: 391 },
  tile: { width: 1200, height: 569 },
  // Derived, not measured. Kept at the `tile` aspect ratio so it crops the same
  // way. 800w because detail-page tiles and gallery frames render full-width
  // below `md` (~390 CSS px at 2x); 400w was visibly soft there.
  tileMobile: { width: 800, height: 379 },
  portrait: { width: 716, height: 955 },
  portraitMobile: { width: 370, height: 494 },
  icon: { width: 150, height: 150 },
  thumbGallery: { width: 300, height: 300 },
  /**
   * Derived, not measured. The footer gallery is `grid-cols-4` below `sm`, so a
   * tile is ~67 CSS px on a 390px phone and ~102 CSS px at the 767px breakpoint
   * — roughly 2x density at 200w across that whole range.
   *
   * Deliberately not 150: at the wide end of the mobile range a 3x display wants
   * closer to 300, so this slot trades a little sharpness on 3x phones for about
   * half the bytes. That tradeoff is the reason the desktop tile is 300 and not
   * the 150x150 `icon` size in the first place.
   */
  thumbGalleryMobile: { width: 200, height: 200 },
} as const;

export type MediaRole = keyof typeof TARGET;

export interface MediaTarget {
  width: number;
  height: number;
}

/**
 * Byte budget per slot, so "optimized" is enforceable rather than aspirational.
 *
 * Set just above the largest object published in each slot, since those are
 * known-acceptable: hero tops out at 224 KB (`emerald-mining/hero.webp`), tiles
 * at 138 KB, portraits at 64 KB, icons at 7 KB, gallery thumbs at 24 KB. A detail-rich source can
 * otherwise double the LCP payload at a fixed quality without anything
 * objecting.
 */
const BYTE_BUDGET: Readonly<Record<MediaRole, number>> = {
  hero: 230 * 1024,
  heroMobile: 70 * 1024,
  tile: 150 * 1024,
  tileMobile: 70 * 1024,
  portrait: 90 * 1024,
  portraitMobile: 35 * 1024,
  icon: 15 * 1024,
  thumbGallery: 30 * 1024,
  thumbGalleryMobile: 15 * 1024,
};

export function byteBudgetFor(role: MediaRole): number {
  return BYTE_BUDGET[role];
}

function extensionOf(key: string): string {
  return path.extname(key).toLowerCase();
}

/**
 * Infer the slot a file fills from its key.
 *
 * This is the whole ergonomic contract: drop an image of any size at the key you
 * want it published under, and the filename decides its output size. A
 * `-mobile` suffix selects the mobile variant of the same slot.
 *
 * Matched against the **basename**, not the whole key, so a directory name
 * cannot decide the role of everything beneath it. `images/brand/categories/`
 * holds both a 1200x569 landscape tile (`nature.webp`) and a 716x955 3:4 crop
 * (`emerald-mining.webp`), so keying off the directory mis-sized the landscape
 * ones.
 *
 * Only an explicit `card` filename means the narrow 3:4 crop; anything
 * unrecognized falls back to the landscape tile, the most common shape.
 *
 * `ugc-*` is checked before `thumb` so the footer gallery gets the 300x300
 * `thumbGallery` slot rather than the 150x150 `icon` one: those tiles render at
 * roughly 200 CSS px, so a 150w source is visibly soft on a 2x display.
 */
export function inferRole(key: string): MediaRole {
  const name = path.basename(key).toLowerCase();
  const mobile = name.includes('-mobile');

  if (/^ugc[-.]|^ugc\d/.test(name)) return mobile ? 'thumbGalleryMobile' : 'thumbGallery';
  if (/avatar|thumb/.test(name)) return 'icon';
  if (/^card\b|^card[-.]/.test(name)) return mobile ? 'portraitMobile' : 'portrait';
  if (/hero|final-cta/.test(name)) return mobile ? 'heroMobile' : 'hero';

  return mobile ? 'tileMobile' : 'tile';
}

/** Output size for a slot, used when nothing is published at that key yet. */
export function targetFor(role: MediaRole): MediaTarget {
  return TARGET[role];
}

/**
 * The key a file will be published under.
 *
 * Delivery formats keep their extension; sources take the extension of what
 * they convert into.
 */
export function toDeliveryKey(key: string): string {
  const ext = extensionOf(key);
  if (DELIVERY_EXTENSIONS.has(ext)) return key;

  const base = key.slice(0, key.length - ext.length);
  if (VIDEO_SOURCE_EXTENSIONS.has(ext)) return `${base}.webm`;
  return `${base}.webp`;
}

/** A raster source that must be converted to `.webp`. */
export function isImageSource(key: string): boolean {
  return IMAGE_SOURCE_EXTENSIONS.has(extensionOf(key));
}

/** A video source that must be converted to `.webm`. */
export function isVideoSource(key: string): boolean {
  return VIDEO_SOURCE_EXTENSIONS.has(extensionOf(key));
}

/** Any raster image the optimizer inspects, converted or not. */
export function isReviewableImage(key: string): boolean {
  return REVIEWABLE_IMAGE_EXTENSIONS.has(extensionOf(key));
}

/** Any video the optimizer inspects, converted or not. */
export function isReviewableVideo(key: string): boolean {
  return REVIEWABLE_VIDEO_EXTENSIONS.has(extensionOf(key));
}

/** True when the file is already in a format the CDN serves. */
export function isDeliveryFormat(key: string): boolean {
  return DELIVERY_EXTENSIONS.has(extensionOf(key));
}

/** True when a resize must carry every frame across. */
export function isAnimatedCapable(key: string): boolean {
  return ANIMATED_CAPABLE_EXTENSIONS.has(extensionOf(key));
}

/**
 * The source files whose delivery output is confirmed published, and which are
 * therefore safe to remove from the local mirror.
 *
 * Only delivery formats are ever uploaded, so a `.jpg` that has already become a
 * published `.webp` is not part of the published set and only takes up space in
 * `r2-cache/`. A source is returned **only** when its own output key is in
 * `publishedKeys` — never on a name match alone, because the original is the one
 * full-resolution copy and R2 has no object versioning to recover it from.
 *
 * A delivery file is never its own source: `toDeliveryKey` is the identity for
 * those, and deleting one would remove the published object from the mirror.
 * Colliding sources are also retained: when `photo.jpg` and `photo.png` both map
 * to `photo.webp`, the published object cannot prove which original produced it.
 */
export function selectPrunableSources(
  sourceKeys: readonly string[],
  publishedKeys: ReadonlySet<string>,
): string[] {
  const sourceCountByDelivery = new Map<string, number>();

  for (const key of sourceKeys) {
    const delivery = toDeliveryKey(key);
    sourceCountByDelivery.set(delivery, (sourceCountByDelivery.get(delivery) ?? 0) + 1);
  }

  return sourceKeys.filter((key) => {
    const delivery = toDeliveryKey(key);
    return (
      delivery !== key &&
      publishedKeys.has(delivery) &&
      sourceCountByDelivery.get(delivery) === 1
    );
  });
}
