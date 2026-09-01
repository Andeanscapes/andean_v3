import { describe, expect, it } from 'vitest';
import { EXPERIENCE_I18N } from '@/i18n/mappings/experience';
import { ExperienceFeedV2Schema, type ExperienceFeedV2 } from '@/lib/schemas/feed/v2';
import { EXPERIENCE_EMERALD_MINING_FIXTURE, cloneFixture } from '@/test/fixtures';
import { adaptExperienceFeedV2 } from './experienceFeedAdapter';

describe('adaptExperienceFeedV2', () => {
  it('resolves logistics keys from the experience mapping', () => {
    const feed = cloneFixture(EXPERIENCE_EMERALD_MINING_FIXTURE);
    const result = adaptExperienceFeedV2(
      feed,
      EXPERIENCE_I18N[feed.experience.id],
      'https://wa.me/573142730360',
    );

    expect(result.config.logistics?.map((item) => item.label)).toEqual([
      'experiences.emeraldMining.logistics.start',
      'experiences.emeraldMining.logistics.duration',
      'experiences.emeraldMining.logistics.transport',
      'experiences.emeraldMining.logistics.difficulty',
    ]);
  });

  it('fails with an actionable error when a tier mapping is missing', () => {
    const feed = cloneFixture(EXPERIENCE_EMERALD_MINING_FIXTURE);
    const malformed = {
      ...feed,
      accommodationTiers: feed.accommodationTiers.map((tier) => ({ ...tier, id: 'missing' })),
    } as unknown as ExperienceFeedV2;

    expect(() =>
      adaptExperienceFeedV2(
        malformed,
        EXPERIENCE_I18N[feed.experience.id],
        'https://wa.me/573142730360',
      ),
    ).toThrow('[ExperienceFeedAdapter] No i18n mapping for tier "missing"');
  });

  it('keeps malformed adapter input outside the typed feed contract', () => {
    const feed = cloneFixture(EXPERIENCE_EMERALD_MINING_FIXTURE);
    const malformed = {
      ...feed,
      accommodationTiers: feed.accommodationTiers.map((tier) => ({ ...tier, id: 'missing' })),
    } as unknown;

    expect(ExperienceFeedV2Schema.safeParse(malformed).success).toBe(false);
  });
});
