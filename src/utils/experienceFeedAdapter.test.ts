import { describe, expect, it } from 'vitest';
import { EXPERIENCE_I18N } from '@/i18n/mappings/experience';
import { ExperienceFeedV2Schema, type ExperienceFeedV2 } from '@/lib/schemas/feed/v2';
import { EXPERIENCE_FIXTURE, EXPERIENCE_FIXTURES, cloneFixture } from '@/test/fixtures';
import enMessages from '@/i18n/messages/en.json';
import esMessages from '@/i18n/messages/es.json';
import frMessages from '@/i18n/messages/fr.json';
import { adaptExperienceFeedV2 } from './experienceFeedAdapter';

describe('adaptExperienceFeedV2', () => {
  it('passes feed-owned hero video through to the UI config', () => {
    const feed = cloneFixture(EXPERIENCE_FIXTURE);
    feed.experience.media.video = {
      desktop: '/videos/experiences/emerald-mining/hero.webm',
      mobile: '/videos/experiences/emerald-mining/hero-mobile.webm',
    };

    const result = adaptExperienceFeedV2(
      feed,
      EXPERIENCE_I18N[feed.experience.id],
      'https://wa.me/573142730360',
    );

    expect(result.config.video).toEqual(feed.experience.media.video);
  });

  it('resolves logistics keys from the experience mapping', () => {
    const feed = cloneFixture(EXPERIENCE_FIXTURE);
    const result = adaptExperienceFeedV2(
      feed,
      EXPERIENCE_I18N[feed.experience.id],
      'https://wa.me/573142730360',
    );

    expect(result.config.logistics?.map((item) => item.label)).toEqual([
      'experiences.chivorEmeraldCore.logistics.start',
      'experiences.chivorEmeraldCore.logistics.duration',
      'experiences.chivorEmeraldCore.logistics.transport',
      'experiences.chivorEmeraldCore.logistics.difficulty',
    ]);
  });

  it('fails with an actionable error when a tier mapping is missing', () => {
    const feed = cloneFixture(EXPERIENCE_FIXTURE);
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
    const feed = cloneFixture(EXPERIENCE_FIXTURE);
    const malformed = {
      ...feed,
      accommodationTiers: feed.accommodationTiers.map((tier) => ({ ...tier, id: 'missing' })),
    } as unknown;

    expect(ExperienceFeedV2Schema.safeParse(malformed).success).toBe(false);
  });

  it('passes includedInPlan through to the UI addons', () => {
    const feed = cloneFixture(EXPERIENCE_FIXTURE);
    feed.addons = feed.addons.map((addon, index) =>
      index === 0 ? { ...addon, pricePerPerson: 0, includedInPlan: true } : addon,
    );

    const result = adaptExperienceFeedV2(
      feed,
      EXPERIENCE_I18N[feed.experience.id],
      'https://wa.me/573142730360',
    );

    expect(result.addons?.map((addon) => addon.includedInPlan)).toEqual(
      feed.addons.map((addon) => addon.includedInPlan),
    );
    expect(result.addons?.[0]?.includedInPlan).toBe(true);
  });
});

describe('adaptExperienceFeedV2 value points', () => {
  it("passes the experience's own value points through, in order", () => {
    const feed = cloneFixture(EXPERIENCE_FIXTURE);
    const mapping = EXPERIENCE_I18N[feed.experience.id];

    const result = adaptExperienceFeedV2(feed, mapping, 'https://wa.me/573142730360');

    expect(result.config.valueStack).toEqual([...mapping.valueStack]);
  });
});

describe('ExperienceFeedV2Schema package tags', () => {
  function withPackageTags(packageTags: unknown): unknown {
    const feed = cloneFixture(EXPERIENCE_FIXTURE);
    return { ...feed, experience: { ...feed.experience, packageTags } };
  }

  it('accepts the all-inclusive tag', () => {
    expect(ExperienceFeedV2Schema.safeParse(withPackageTags(['allInclusive'])).success).toBe(true);
  });

  it('rejects a duplicate tag', () => {
    expect(
      ExperienceFeedV2Schema.safeParse(withPackageTags(['allInclusive', 'allInclusive'])).success,
    ).toBe(false);
  });

  // Exclusions are stated at the arrival selector and in "not included", never as a card badge.
  it('rejects the retired transport-not-included badge', () => {
    expect(ExperienceFeedV2Schema.safeParse(withPackageTags(['transportNotIncluded'])).success).toBe(false);
  });
});

describe('ExperienceFeedV2Schema addons', () => {
  function withFirstAddon(patch: { pricePerPerson: number; includedInPlan: boolean }): unknown {
    const feed = cloneFixture(EXPERIENCE_FIXTURE);
    return {
      ...feed,
      addons: feed.addons.map((addon, index) => (index === 0 ? { ...addon, ...patch } : addon)),
    };
  }

  it('accepts an included addon priced at 0', () => {
    expect(
      ExperienceFeedV2Schema.safeParse(withFirstAddon({ pricePerPerson: 0, includedInPlan: true }))
        .success,
    ).toBe(true);
  });

  it('rejects an included addon with a price', () => {
    const result = ExperienceFeedV2Schema.safeParse(
      withFirstAddon({ pricePerPerson: 120000, includedInPlan: true }),
    );

    expect(result.success).toBe(false);
    expect(result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'))).toContain(
      'addons.0.pricePerPerson',
    );
  });
});

/**
 * Every published experience, not only the landing flagship: a stop id the
 * mapping does not know throws in the adapter and takes that experience's whole
 * detail page down, so each file must adapt and every stop must have copy.
 */
describe('every published experience adapts', () => {
  const LOCALES = { en: enMessages, es: esMessages, fr: frMessages };
  const resolve = (messages: unknown, key: string): unknown =>
    key.split('.').reduce<unknown>(
      (node, part) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined),
      messages,
    );

  it.each(Object.entries(EXPERIENCE_FIXTURES))('%s has copy for every itinerary stop', (_file, feed) => {
    const result = adaptExperienceFeedV2(feed, EXPERIENCE_I18N[feed.experience.id], 'https://wa.me/573142730360');
    const keys = (result.accommodationTiers ?? []).flatMap((tier) =>
      (tier.itinerary ?? []).flatMap((day) =>
        day.stops.flatMap((stop) => [stop.title, stop.shortDescription, stop.description]),
      ),
    );

    expect(keys.length).toBeGreaterThan(0);
    for (const [locale, messages] of Object.entries(LOCALES)) {
      expect(keys.filter((key) => typeof resolve(messages, key ?? '') !== 'string'), locale).toEqual([]);
    }
  });
});

/**
 * The transitional id is served by the pre-split feed, whose six stops keep the
 * old schedule. Pointing them at Core's new copy mislabels every stop on
 * production until the Chivor feed replaces it.
 */
describe('legacy emeraldMining alias', () => {
  it('keeps the pre-split itinerary copy for the old stops', () => {
    const stops = EXPERIENCE_I18N.emeraldMining.tiers.heritage.stops;

    expect(Object.keys(stops)).toEqual(['stop1', 'stop2', 'stop3', 'stop4', 'stop5', 'stop6']);
    expect(stops.stop1.title).toBe('experiences.tiers.heritage.itinerary.stop1Title');
    expect(EXPERIENCE_I18N.chivorEmeraldCore.tiers.heritage.stops.stop1.title).not.toBe(stops.stop1.title);
  });
});
