import { describe, expect, it } from 'vitest';
import { MediaPathSchema } from './common.schema';

/**
 * `MediaPathSchema` is a security boundary, not a formatting rule.
 *
 * Feed-supplied media paths are resolved into URLs by `resolveMediaUrl` and
 * joined onto `r2-cache/` by the `media:*` scripts, so the values it admits
 * decide both which origin the site can be pointed at and which directory the
 * tooling can write to. These cover the rejections that matter.
 */
describe('MediaPathSchema', () => {
  it.each([
    '/images/brand/landing-hero.webp',
    '/videos/experiences/emerald-mining/hero.webm',
    '/images/brand/footer/ugc-1.webp',
    // A dot inside a segment is ordinary punctuation, not traversal.
    '/images/brand/hero..webp',
    '/images/brand/.hidden.webp',
  ])('accepts the app-relative path %s', (value) => {
    expect(MediaPathSchema.safeParse(value).success).toBe(true);
  });

  /** An absolute or protocol-relative value would move media to another origin. */
  it.each([
    'https://evil.example.com/x.webp',
    'http://evil.example.com/x.webp',
    '//evil.example.com/x.webp',
    'javascript:alert(1)',
    'images/brand/hero.webp',
  ])('rejects the off-origin value %s', (value) => {
    expect(MediaPathSchema.safeParse(value).success).toBe(false);
  });

  /** A `..` segment escapes `r2-cache/` once the scripts join it onto a path. */
  it.each([
    '/images/../../etc/passwd',
    '/images/brand/../../../x.webp',
    '/..',
    '/../x.webp',
    '/images/..',
  ])('rejects the traversing path %s', (value) => {
    expect(MediaPathSchema.safeParse(value).success).toBe(false);
  });

  /** Whitespace and backslashes break URL construction and Windows paths alike. */
  it.each(['/images/my file.webp', '/images\\brand\\hero.webp', '/images/hero.webp\n'])(
    'rejects the unsafe character in %j',
    (value) => {
      expect(MediaPathSchema.safeParse(value).success).toBe(false);
    },
  );
});
