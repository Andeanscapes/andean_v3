/**
 * Unit coverage for the new-field gate in `feed:sync`. Pure — no network, no
 * `fixtures/`.
 */

import { describe, expect, it } from 'vitest';
import { findNewKeyPaths } from './feed-fields';

const LIVE = {
  media: { hero: '/images/brand/hero.webp', categories: { nature: '/images/n.webp' } },
  experiences: [{ id: 'a', media: { card: '/images/a.webp' } }],
};

describe('findNewKeyPaths', () => {
  it('reports nothing when only values change', () => {
    const local = { ...LIVE, media: { ...LIVE.media, hero: '/images/brand/hero-02.webp' } };
    expect(findNewKeyPaths(LIVE, local)).toEqual([]);
  });

  it('reports a new optional field', () => {
    const local = { ...LIVE, media: { ...LIVE.media, hostPortrait: '/images/brand/p.webp' } };
    expect(findNewKeyPaths(LIVE, local)).toEqual(['media.hostPortrait']);
  });

  it('ignores array elements that reuse a published shape', () => {
    const local = {
      ...LIVE,
      experiences: [...LIVE.experiences, { id: 'b', media: { card: '/images/b.webp' } }],
    };
    expect(findNewKeyPaths(LIVE, local)).toEqual([]);
  });

  it('reports a new field inside array elements', () => {
    const local = {
      ...LIVE,
      experiences: [{ id: 'a', media: { card: '/images/a.webp', gallery: [] } }],
    };
    expect(findNewKeyPaths(LIVE, local)).toEqual(['experiences[].media.gallery']);
  });

  it('reports every path of a file that is not live yet', () => {
    expect(findNewKeyPaths(null, { a: { b: 1 } })).toEqual(['a', 'a.b']);
  });
});
