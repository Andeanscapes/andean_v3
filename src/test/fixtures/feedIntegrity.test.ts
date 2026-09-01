/**
 * Feed contract + i18n integrity.
 *
 * Replaces the coverage lost with `landing.reviews.test.ts` when the local mocks
 * were deleted. Runs against the local copies of the live feed in the gitignored
 * `fixtures/` directory, so it is offline and deterministic once downloaded.
 *
 * This matters more now than it did with mocks: feed data is remote while copy
 * is still bundled locally (`src/i18n/request.ts` static-imports the message
 * files). A feed edit that introduces a new key without a matching entry in
 * en/es/fr renders the raw key in production, and nothing else catches it.
 *
 * When these fail, either re-download the payloads (`npm run fixtures:fetch`) or
 * fix the live feed — do not relax the assertions.
 */

import { describe, it, expect } from 'vitest';
import enMessages from '@/i18n/messages/en.json';
import esMessages from '@/i18n/messages/es.json';
import frMessages from '@/i18n/messages/fr.json';
import { EXPERIENCE_I18N, EXPERIENCE_METADATA_NAMESPACE } from '@/i18n/mappings/experience';
import {
  LANDING_FIXTURE,
  EXPERIENCES_LIST_FIXTURE,
  EXPERIENCE_EMERALD_MINING_FIXTURE,
} from './index';

const LOCALES = { en: enMessages, es: esMessages, fr: frMessages };

function resolveKey(messages: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((node, part) => {
    if (node && typeof node === 'object' && part in node) {
      return (node as Record<string, unknown>)[part];
    }
    return undefined;
  }, messages);
}

/** Every string in the payload that looks like a translation key. */
function collectKeys(value: unknown, acc: string[] = []): string[] {
  if (typeof value === 'string') {
    if (/^(Landing|ExperiencesList|experiences)\.[A-Za-z0-9_.]+$/.test(value)) acc.push(value);
    return acc;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectKeys(item, acc);
    return acc;
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectKeys(item, acc);
  }
  return acc;
}

const FEEDS = {
  'landing.json': LANDING_FIXTURE,
  'experiences-list.json': EXPERIENCES_LIST_FIXTURE,
  'experience-emerald-mining.json': EXPERIENCE_EMERALD_MINING_FIXTURE,
} as const;

/**
 * Inverted for v2.
 *
 * The v1 feed embedded i18n keys, so this block asserted they all resolved. v2
 * carries stable domain codes only — copy is resolved from
 * `src/i18n/mappings/*` — so a translation path appearing in a payload now means
 * the CDN has drifted back to the old contract.
 */
describe('feed carries no translation keys', () => {
  for (const [feed, payload] of Object.entries(FEEDS)) {
    it(`${feed} embeds no i18n key`, () => {
      expect(Array.from(new Set(collectKeys(payload)))).toEqual([]);
    });
  }
});

describe('landing reviews integrity', () => {
  const { reviews, reviewSummary, featuredReviewIds } = LANDING_FIXTURE;

  it('aggregate covers at least the published reviews', () => {
    // The trust panel advertises the total, so the aggregate may exceed the
    // shipped subset — but never undercount it.
    expect(reviewSummary.count).toBeGreaterThanOrEqual(reviews.length);
  });

  it('aggregate rating equals the mean of the published reviews', () => {
    const mean = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    expect(reviewSummary.rating).toBeCloseTo(mean, 5);
  });

  it('every featured review id resolves to a published review', () => {
    const ids = new Set(reviews.map((review) => review.id));
    for (const id of featuredReviewIds) {
      expect(ids, `featured review "${id}" is not published`).toContain(id);
    }
  });

  it('carries review facts as codes, never rendered copy', () => {
    // v2 owns the facts; the comment, country label and verification wording
    // are all resolved from the mapping tables at render time.
    for (const review of reviews) {
      expect(review).not.toHaveProperty('comment');
      expect(review).not.toHaveProperty('commentKey');
      expect(review).not.toHaveProperty('country');
      expect(review).not.toHaveProperty('countryFlag');
      expect(review).not.toHaveProperty('avatarUrl');
      if (review.countryCode !== undefined) {
        expect(review.countryCode).toMatch(/^[A-Z]{2}$/);
      }
    }
  });

  it('every review has comment copy in every locale', () => {
    const commentKeys = EXPERIENCE_I18N[LANDING_FIXTURE.flagshipExperienceId].reviews;
    for (const review of reviews) {
      const key = commentKeys[review.id as keyof typeof commentKeys];
      expect(key, `review "${review.id}" has no comment mapping`).toBeTruthy();
      for (const [locale, messages] of Object.entries(LOCALES)) {
        expect(resolveKey(messages, key), `${key} missing in ${locale}`).toBeTypeOf('string');
      }
    }
  });
});

describe('experiences-list routing contract', () => {
  /**
   * v2 drops `metadataNamespace` from the payload — SEO namespaces are frontend
   * concerns — so the catalog reads it from `EXPERIENCE_METADATA_NAMESPACE`. An
   * experience in the feed with no entry there produces `undefined` for the page
   * metadata namespace, which throws at `getTranslations`. Guard both halves.
   */
  it('every published experience has a frontend metadata namespace', () => {
    for (const entry of EXPERIENCES_LIST_FIXTURE.experiences) {
      if (entry.status !== 'published') continue;
      expect(
        EXPERIENCE_METADATA_NAMESPACE[entry.id],
        `experience "${entry.id}" has no metadata namespace`,
      ).toBeTruthy();
    }
  });

  it('metadata namespaces resolve to a real namespace in every locale', () => {
    for (const namespace of Object.values(EXPERIENCE_METADATA_NAMESPACE)) {
      for (const [locale, messages] of Object.entries(LOCALES)) {
        expect(resolveKey(messages, namespace), `${namespace} missing in ${locale}`).toBeTypeOf(
          'object',
        );
      }
    }
  });

  it('every published experience has an i18n mapping', () => {
    for (const entry of EXPERIENCES_LIST_FIXTURE.experiences) {
      if (entry.status !== 'published') continue;
      expect(EXPERIENCE_I18N[entry.id], `experience "${entry.id}" has no i18n mapping`).toBeDefined();
    }
  });
});
