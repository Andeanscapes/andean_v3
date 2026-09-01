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
});
