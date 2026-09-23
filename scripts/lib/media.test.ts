/**
 * Unit coverage for the media conventions.
 *
 * These are pure functions with no I/O, but they decide the width every uploaded
 * image is resized to — so a wrong answer here silently degrades published
 * media. The `PUBLISHED` table below is measured from the objects actually in
 * R2, which is what makes the ceiling assertions meaningful rather than
 * self-referential.
 */

import { describe, expect, it } from 'vitest';
import {
  inferRole,
  isAnimatedCapable,
  isDeliveryFormat,
  isImageSource,
  isReviewableImage,
  isReviewableVideo,
  isVideoSource,
  needsExternalDecode,
  selectPrunableSources,
  targetFor,
  toDeliveryKey,
} from './media';

/**
 * Key -> published `width x height`, measured with `sharp` against
 * `cdn.andeanscapes.com`. The role table is only consulted for keys nothing is
 * published under, so its job is to be the right *shape* for a new file in that
 * slot — which is what these assertions check.
 */
const PUBLISHED: ReadonlyArray<readonly [string, number, number]> = [
  ['/images/brand/landing-hero.webp', 1600, 751],
  ['/images/brand/landing-hero-mobile.webp', 800, 375],
  ['/images/brand/final-cta.webp', 1600, 752],
  ['/images/brand/categories/nature.webp', 1200, 570],
  ['/images/brand/categories/rural.webp', 1200, 563],
  ['/images/brand/categories/horseback.webp', 1200, 569],
  ['/images/brand/categories/emerald-mining.webp', 716, 955],
  ['/images/experiences/list-hero.webp', 1600, 758],
  ['/images/experiences/list-hero-mobile.webp', 824, 391],
  ['/images/experiences/emerald-mining/hero.webp', 1600, 758],
  ['/images/experiences/emerald-mining/hero-mobile.webp', 824, 391],
  ['/images/experiences/emerald-mining/card.webp', 716, 955],
  ['/images/experiences/emerald-mining/card-mobile.webp', 370, 494],
  ['/images/experiences/emerald-mining/gallery-1.webp', 1200, 569],
  ['/images/experiences/emerald-mining/gallery-2.webp', 1200, 570],
  ['/images/experiences/emerald-mining/gallery-3.webp', 1200, 563],
  ['/images/experiences/emerald-mining/host-avatar.webp', 150, 150],
  ['/images/experiences/emerald-mining/tier-standard-thumb.webp', 150, 150],
];

/** Same tolerance the optimizer treats as "the same framing". */
const ASPECT_TOLERANCE = 0.02;

describe('inferRole', () => {
  /**
   * The regression this guards: the role decides how a new image is cropped, so
   * a role whose aspect ratio disagrees with the slot silently reframes it.
   * `emerald-mining.webp` is deliberately excluded — it is a 3:4 crop sitting in
   * `categories/` alongside landscape tiles, so no filename rule can infer it;
   * it is covered by the published-dimension path instead.
   */
  it('infers a role whose aspect ratio matches the slot', () => {
    const wrongShape = PUBLISHED.filter(
      ([key]) => key !== '/images/brand/categories/emerald-mining.webp',
    )
      .map(([key, width, height]) => {
        const target = targetFor(inferRole(key));
        const published = width / height;
        const inferred = target.width / target.height;
        return { key, published, inferred, drift: Math.abs(inferred - published) / published };
      })
      .filter((row) => row.drift > ASPECT_TOLERANCE)
      .map(
        (row) =>
          `${row.key} published ${row.published.toFixed(3)}:1, role gives ${row.inferred.toFixed(3)}:1`,
      );

    expect(wrongShape, 'role aspect must match the published slot').toEqual([]);
  });

  it('sizes landscape category tiles as tiles, not as the portrait crop', () => {
    expect(inferRole('/images/brand/categories/horseback.webp')).toBe('tile');
    expect(targetFor(inferRole('/images/brand/categories/horseback.webp'))).toEqual({
      width: 1200,
      height: 569,
    });
  });

  it('treats an explicit card filename as the 3:4 crop', () => {
    expect(inferRole('/images/experiences/emerald-mining/card.webp')).toBe('portrait');
    expect(inferRole('/images/experiences/emerald-mining/card-mobile.webp')).toBe('portraitMobile');
  });

  it('recognizes hero slots and their mobile siblings', () => {
    expect(inferRole('/images/brand/landing-hero.webp')).toBe('hero');
    expect(inferRole('/images/brand/landing-hero-mobile.webp')).toBe('heroMobile');
    expect(inferRole('/images/brand/final-cta.webp')).toBe('hero');
  });

  it('recognizes avatars and thumbnails as icons', () => {
    expect(inferRole('/images/experiences/x/host-avatar.webp')).toBe('icon');
    expect(inferRole('/images/experiences/x/tier-standard-thumb.webp')).toBe('icon');
  });

  /**
   * The footer gallery renders at ~200 CSS px, so it takes the 300x300 slot and
   * not the 150x150 `icon` one a `thumb`-style name would land in.
   */
  it('routes the footer gallery to the 300x300 slot', () => {
    expect(inferRole('/images/brand/footer/ugc-1.webp')).toBe('thumbGallery');
    expect(targetFor(inferRole('/images/brand/footer/ugc-1.webp'))).toEqual({
      width: 300,
      height: 300,
    });
  });

  it('keeps the footer gallery out of the icon slot', () => {
    expect(inferRole('/images/brand/footer/ugc-4.webp')).not.toBe('icon');
  });

  /**
   * `^ugc` is matched before the `-mobile` check, so without an explicit mobile
   * role the sibling was emitted at the desktop 300x300 — a byte-identical file
   * that made the whole variant pointless.
   */
  it('routes the footer gallery -mobile sibling to its own slot', () => {
    expect(inferRole('/images/brand/footer/ugc-1-mobile.webp')).toBe('thumbGalleryMobile');
    expect(targetFor(inferRole('/images/brand/footer/ugc-1-mobile.webp'))).toEqual({
      width: 200,
      height: 200,
    });
  });

  /** A directory name must not decide the role of everything beneath it. */
  it('matches on the basename, not the directory', () => {
    expect(inferRole('/images/hero/nature.webp')).toBe('tile');
    expect(inferRole('/images/card/gallery-1.webp')).toBe('tile');
  });

  /** The `-mobile` suffix is the whole mobile-variant contract. */
  it('selects the mobile variant of the same slot from the suffix', () => {
    expect(inferRole('/images/x/hero-mobile.jpg')).toBe('heroMobile');
    expect(inferRole('/images/x/card-mobile.jpg')).toBe('portraitMobile');
    expect(inferRole('/images/x/gallery-1-mobile.jpg')).toBe('tileMobile');
  });

  it('keeps every mobile variant narrower than its desktop counterpart', () => {
    for (const [desktop, mobile] of [
      ['hero', 'heroMobile'],
      ['tile', 'tileMobile'],
      ['portrait', 'portraitMobile'],
      ['thumbGallery', 'thumbGalleryMobile'],
    ] as const) {
      expect(targetFor(mobile).width, `${mobile} vs ${desktop}`).toBeLessThan(
        targetFor(desktop).width,
      );
    }
  });
});

describe('toDeliveryKey', () => {
  it('converts raster sources to webp', () => {
    expect(toDeliveryKey('/images/brand/landing-hero.jpg')).toBe('/images/brand/landing-hero.webp');
    expect(toDeliveryKey('/images/a/b.PNG')).toBe('/images/a/b.webp');
    expect(toDeliveryKey('/images/a/b.heic')).toBe('/images/a/b.webp');
  });

  it('converts video sources to webm', () => {
    expect(toDeliveryKey('/videos/x/hero.mov')).toBe('/videos/x/hero.webm');
    expect(toDeliveryKey('/videos/x/hero.mp4')).toBe('/videos/x/hero.webm');
  });

  it('leaves delivery formats untouched', () => {
    for (const key of ['/images/a.webp', '/images/a.avif', '/videos/a.webm', '/images/a.svg']) {
      expect(toDeliveryKey(key)).toBe(key);
    }
  });

  it('keeps dots in directory names out of the extension swap', () => {
    expect(toDeliveryKey('/images/v1.2/hero.jpg')).toBe('/images/v1.2/hero.webp');
  });
});

describe('format classification', () => {
  /**
   * The regression this guards: `.webp` was absent from the reviewable set, so
   * an oversized WebP dropped into the cache was never measured and uploaded at
   * whatever resolution it happened to have.
   */
  it('reviews delivery-format images so an oversized one cannot pass through', () => {
    expect(isReviewableImage('/images/a.webp')).toBe(true);
    expect(isReviewableImage('/images/a.avif')).toBe(true);
    expect(isReviewableVideo('/videos/a.webm')).toBe(true);
  });

  it('reviews raster and video sources', () => {
    for (const ext of ['jpg', 'jpeg', 'png', 'tif', 'tiff', 'heic', 'heif', 'gif']) {
      expect(isReviewableImage(`/images/a.${ext}`), ext).toBe(true);
      expect(isImageSource(`/images/a.${ext}`), ext).toBe(true);
    }
    for (const ext of ['mov', 'mp4', 'm4v', 'avi', 'mkv']) {
      expect(isReviewableVideo(`/videos/a.${ext}`), ext).toBe(true);
      expect(isVideoSource(`/videos/a.${ext}`), ext).toBe(true);
    }
  });

  it('does not treat a delivery format as a source needing conversion', () => {
    expect(isImageSource('/images/a.webp')).toBe(false);
    expect(isImageSource('/images/a.avif')).toBe(false);
    expect(isVideoSource('/videos/a.webm')).toBe(false);
  });

  it('classifies delivery formats', () => {
    expect(isDeliveryFormat('/images/a.webp')).toBe(true);
    expect(isDeliveryFormat('/images/a.svg')).toBe(true);
    expect(isDeliveryFormat('/images/a.jpg')).toBe(false);
  });

  it('does not review unrelated files', () => {
    for (const key of ['/images/README.md', '/images/a.txt', '/images/.DS_Store']) {
      expect(isReviewableImage(key), key).toBe(false);
      expect(isReviewableVideo(key), key).toBe(false);
    }
  });

  it('is case-insensitive about extensions', () => {
    expect(isImageSource('/images/A.JPG')).toBe(true);
    expect(isDeliveryFormat('/images/A.WEBP')).toBe(true);
  });
});

describe('isAnimatedCapable', () => {
  /** GIF and WebP carry frames; resizing without `animated: true` keeps only the first. */
  it('flags the formats whose frames must survive a resize', () => {
    expect(isAnimatedCapable('/images/a.gif')).toBe(true);
    expect(isAnimatedCapable('/images/a.webp')).toBe(true);
  });

  it('does not flag single-frame formats', () => {
    expect(isAnimatedCapable('/images/a.jpg')).toBe(false);
    expect(isAnimatedCapable('/images/a.png')).toBe(false);
  });
});

describe('needsExternalDecode', () => {
  /**
   * sharp's bundled libvips registers HEIF for AVIF only — the HEVC decoder
   * HEIC needs is omitted for patent reasons — so an iPhone `.heic` opens as a
   * valid container and then fails mid-stream. These must be routed through an
   * external decoder rather than handed to sharp.
   */
  it('flags the formats sharp cannot decode', () => {
    expect(needsExternalDecode('/images/a.heic')).toBe(true);
    expect(needsExternalDecode('/images/a.HEIF')).toBe(true);
  });

  it('does not flag formats sharp reads natively', () => {
    for (const key of ['/images/a.jpg', '/images/a.png', '/images/a.webp', '/images/a.avif']) {
      expect(needsExternalDecode(key), key).toBe(false);
    }
  });

  /** They remain sources: still converted, just decoded differently first. */
  it('keeps them classified as image sources', () => {
    expect(isImageSource('/images/a.heic')).toBe(true);
    expect(isReviewableImage('/images/a.heic')).toBe(true);
  });
});

describe('selectPrunableSources', () => {
  it('returns a source once its own output is published', () => {
    expect(
      selectPrunableSources(
        ['/images/brand/landing-hero.jpg', '/videos/x/hero.mov'],
        new Set(['/images/brand/landing-hero.webp', '/videos/x/hero.webm']),
      ),
    ).toEqual(['/images/brand/landing-hero.jpg', '/videos/x/hero.mov']);
  });

  /**
   * The case that makes this worth a unit test: the original is the only
   * full-resolution copy and R2 has no object versioning, so a source whose
   * upload has not been confirmed must survive.
   */
  it('keeps a source whose output is not published', () => {
    expect(
      selectPrunableSources(
        ['/images/brand/landing-hero.jpg'],
        new Set(['/images/brand/final-cta.webp']),
      ),
    ).toEqual([]);
  });

  /** A delivery file is its own output; deleting it would remove the published object. */
  it('never prunes a delivery format', () => {
    expect(
      selectPrunableSources(
        ['/images/brand/landing-hero.webp', '/videos/x/hero.webm', '/images/a.svg'],
        new Set(['/images/brand/landing-hero.webp', '/videos/x/hero.webm', '/images/a.svg']),
      ),
    ).toEqual([]);
  });

  it('matches the output key, not the basename', () => {
    expect(
      selectPrunableSources(
        ['/images/brand/landing-hero.jpg'],
        new Set(['/images/experiences/landing-hero.webp']),
      ),
    ).toEqual([]);
  });

  it('keeps colliding sources that map to the same delivery key', () => {
    expect(
      selectPrunableSources(
        ['/images/brand/photo.jpg', '/images/brand/photo.png'],
        new Set(['/images/brand/photo.webp']),
      ),
    ).toEqual([]);
  });
});
