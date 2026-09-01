/**
 * Tests for the reviews translator.
 *
 * Guards the i18n contract for reviewer country labels: the feed carries a
 * `countryKey`, the translator resolves it through `t()`, and an absent key
 * yields `undefined` rather than an empty string — an empty string used to
 * render a stray flag/separator in Reviews.tsx.
 *
 * The translator is the pure seam where this happens, so it is tested here
 * rather than through Reviews, which takes an entire LandingContent.
 */

import { describe, it, expect } from 'vitest';
import { toLandingReviewsContent } from './landingTranslators';
import { adaptLandingFeedV2 } from './landingFeedAdapter';
import { LANDING_FIXTURE } from '@/test/fixtures';
import type { LandingFeed } from '@/lib/schemas/landing.schema';

/** Echoes the key back, so assertions can prove a key went through `t()`. */
const echo = (key: string) => key;

/**
 * The translators consume the adapter's output, not the feed, so the fixture is
 * adapted once here rather than hand-building a v1-shaped payload.
 */
const ADAPTED = adaptLandingFeedV2(LANDING_FIXTURE);

function mockWithReviewItems(items: LandingFeed['reviews']['items']): LandingFeed {
  // Nothing is mutated, so a shallow override is enough — no clone needed.
  return { ...ADAPTED, reviews: { ...ADAPTED.reviews, items } };
}

const REVIEW_BASE = {
  id: 'r-1',
  name: 'Tester',
  rating: 5,
  commentKey: 'Landing.reviews.items.example.comment',
} as const;

describe('toLandingReviewsContent', () => {
  it('resolves countryKey through the translator', () => {
    const content = toLandingReviewsContent(
      mockWithReviewItems([
        { ...REVIEW_BASE, countryKey: 'Landing.reviews.countries.colombia', countryFlag: '🇨🇴' },
      ]),
      echo,
    );

    expect(content.items[0].country).toBe('Landing.reviews.countries.colombia');
    expect(content.items[0].countryFlag).toBe('🇨🇴');
  });

  it('leaves country undefined when no countryKey is present', () => {
    const content = toLandingReviewsContent(
      mockWithReviewItems([{ ...REVIEW_BASE }]),
      echo,
    );

    expect(content.items[0].country).toBeUndefined();
    expect(content.items[0].countryFlag).toBeUndefined();
  });

  it('never produces an empty-string country', () => {
    // An empty string is falsy but still renders a separator; undefined does not.
    const content = toLandingReviewsContent(
      mockWithReviewItems([
        { ...REVIEW_BASE, id: 'r-1', countryKey: 'Landing.reviews.countries.spain' },
        { ...REVIEW_BASE, id: 'r-2' },
      ]),
      echo,
    );

    for (const item of content.items) {
      expect(item.country).not.toBe('');
      expect(item.countryFlag).not.toBe('');
    }
  });

  it('translates every country key in the live feed snapshot', () => {
    const content = toLandingReviewsContent(ADAPTED, echo);

    const withCountry = content.items.filter((item) => item.country !== undefined);
    expect(withCountry.length).toBeGreaterThan(0);

    for (const item of withCountry) {
      expect(item.country).toMatch(/^Landing\.reviews\.countries\./);
    }
  });
});
