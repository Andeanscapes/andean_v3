/**
 * Fail-loudly guards for the landing adapter.
 *
 * The adapter is the seam where feed codes become i18n keys, so it is also where
 * an unmapped code has to surface. An earlier revision dropped an unmapped
 * review instead of throwing: the card silently vanished from the trust panel
 * while `reviewSummary.count` kept advertising it, so the page contradicted
 * itself with no error anywhere.
 */

import { describe, it, expect } from 'vitest';
import { adaptLandingFeedV2 } from './landingFeedAdapter';
import { LANDING_FIXTURE, cloneFixture } from '@/test/fixtures';
import { REVIEW_LINKS } from '@/constant/SiteConfig';
import { whatsappUrl } from '@/utils/whatsapp';

function feed() {
  return cloneFixture(LANDING_FIXTURE);
}

describe('adaptLandingFeedV2', () => {
  it('adapts the published payload', () => {
    const raw = adaptLandingFeedV2(feed());

    expect(raw.flagship.experienceId).toBe(LANDING_FIXTURE.flagshipExperienceId);
    expect(raw.reviews.items.length).toBeGreaterThan(0);
    expect(raw.reviews.aggregateRating.reviewCount).toBe(LANDING_FIXTURE.reviewSummary.count);
  });

  it('uses feed media when published', () => {
    const payload = feed();
    payload.media = {
      hero: '/images/brand/hero.webp',
      heroVariants: ['/images/brand/hero-01.webp', '/images/brand/hero-02.webp'],
      finalCta: '/images/brand/final-cta.webp',
      categories: {
        emeraldMining: '/images/brand/category-emerald.webp',
        nature: '/images/brand/category-nature.webp',
        rural: '/images/brand/category-rural.webp',
        horseback: '/images/brand/category-horseback.webp',
      },
    };

    const raw = adaptLandingFeedV2(payload);

    expect(raw.heroBrand.backgroundImage).toBe(payload.media.hero);
    expect(raw.heroBrand.backgroundImageVariants).toEqual(payload.media.heroVariants);
    expect(raw.categories.items.map((item) => item.imageUrl)).toEqual([
      payload.media.categories.emeraldMining,
      payload.media.categories.nature,
      payload.media.categories.rural,
      payload.media.categories.horseback,
    ]);
    expect(raw.finalCta.backgroundImage).toBe(payload.media.finalCta);
  });

  it('keeps legacy media during the staged rollout', () => {
    const payload = feed();
    delete payload.media;

    const raw = adaptLandingFeedV2(payload);

    expect(raw.heroBrand.backgroundImage).toMatch(/^\/assets\//);
    expect(raw.categories.items.every((item) => item.imageUrl.startsWith('/assets/'))).toBe(true);
    expect(raw.finalCta.backgroundImage).toMatch(/^\/assets\//);
    expect(raw.heroBrand.backgroundImageVariants).toEqual([]);
  });

  it('throws when a review has no comment mapping', () => {
    const payload = feed();
    payload.reviews[0].id = 'ghostReviewer';
    payload.featuredReviewIds = [];

    expect(() => adaptLandingFeedV2(payload)).toThrow(/No comment mapping for review/);
  });

  it('throws when the flagship id is not in experiences', () => {
    const payload = feed();
    payload.experiences = [];

    expect(() => adaptLandingFeedV2(payload)).toThrow(/is not in experiences/);
  });

  it('omits booking inventory rather than emitting placeholder values', () => {
    // Landing must not advertise capacity or transport it does not receive:
    // `maxPeople: 0` would be false data, not absent data.
    const raw = adaptLandingFeedV2(feed());

    expect(raw.flagship.maxPeople).toBeUndefined();
    expect(raw.flagship.minPeople).toBeUndefined();
    expect(raw.flagship.transportOptions).toBeUndefined();
  });

  it('passes depositPercent through as undefined when the feed omits it', () => {
    const payload = feed();
    delete payload.experiences[0].depositPercent;

    const raw = adaptLandingFeedV2(payload);

    // Defaulting to 0 would render "0% deposit to confirm".
    expect(raw.flagship.pricing.depositPercent).toBeUndefined();
  });

  it('sources every trust stat from the feed', () => {
    const payload = feed();
    payload.metrics.travelersHostedMinimum = 123;
    payload.metrics.recommendationPercent = 97;

    const values = adaptLandingFeedV2(payload).trustStats.items.map((item) => item.value);

    expect(values).toContain('123+');
    expect(values).toContain('97%');
    // No stat may be a constant the feed cannot move.
    expect(values).not.toContain('100%');
  });

  /** The hero CTA is labelled "Ask on WhatsApp" and opens in a new tab. */
  it('points the hero secondary CTA at WhatsApp', () => {
    const raw = adaptLandingFeedV2(feed());

    expect(raw.heroBrand.secondaryCtaHref).toBe(whatsappUrl());
    expect(raw.heroBrand.secondaryCtaHref).toBe(raw.globalCtas.whatsappHref);
  });

  it('resolves each review source to its public listing link', () => {
    const payload = feed();
    const raw = adaptLandingFeedV2(payload);
    const sourceById = new Map(payload.reviews.map((review) => [review.id, review.source]));

    expect(raw.reviews.items.length).toBeGreaterThan(0);
    for (const item of raw.reviews.items) {
      const source = sourceById.get(item.id);
      expect(source && item.sourceUrl === REVIEW_LINKS[source]).toBe(true);
    }
  });
});
