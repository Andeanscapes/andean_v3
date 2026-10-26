import { describe, expect, it } from 'vitest';
import { createTranslator } from 'next-intl';
import { EXPERIENCE_I18N } from '@/i18n/mappings/experience';
import en from '@/i18n/messages/en.json';
import es from '@/i18n/messages/es.json';
import fr from '@/i18n/messages/fr.json';
import { EXPERIENCE_FIXTURE, cloneFixture } from '@/test/fixtures';
import { adaptExperienceFeedV2 } from './experienceFeedAdapter';
import { whatsappUrl } from './whatsapp';
import { toHeroContent, toWidgetContent } from './experienceTranslators';

const t = (key: string, values?: Record<string, string | number>): string =>
  values ? `${key}:${JSON.stringify(values)}` : key;

describe('toHeroContent plan badge', () => {
  const baseConfig = {
    id: 'chivorEmeraldCore',
    title: 'experiences.chivorEmeraldCore.title',
    subtitle: 'experiences.chivorEmeraldCore.subtitle',
    valueStack: [],
    packageTags: undefined,
    planCode: 'core' as const,
    images: undefined,
    video: undefined,
    depositPercent: 20,
  };

  it('emits a translated plan badge when the feed carries a plan code', () => {
    const content = toHeroContent({ config: baseConfig } as never, t, 20, EXPERIENCE_FIXTURE.experience.duration);
    expect(content.planBadge).toEqual({
      code: 'core',
      label: 'ExperiencesList.planBadges.core',
    });
  });

  it('omits the plan badge when the feed has no plan code', () => {
    const noPlan = { config: { ...baseConfig, planCode: undefined } };
    expect(toHeroContent(noPlan as never, t, 20, EXPERIENCE_FIXTURE.experience.duration).planBadge).toBeUndefined();
  });
});

describe('toHeroContent duration', () => {
  it.each([
    { locale: 'en', messages: en, dayTrip: '1 day', overnight: '2D / 1N', twoDayTrip: '2 days' },
    { locale: 'es', messages: es, dayTrip: '1 día', overnight: '2D / 1N', twoDayTrip: '2 días' },
    { locale: 'fr', messages: fr, dayTrip: '1 jour', overnight: '2J / 1N', twoDayTrip: '2 jours' },
  ])('uses the feed duration in $locale for day trips and overnight stays', ({ locale, messages, dayTrip, overnight, twoDayTrip }) => {
    const translate = createTranslator({ locale, messages });
    const translator = (key: string, values?: Record<string, string | number>) =>
      translate(key as Parameters<typeof translate>[0], values);

    for (const { duration, expected } of [
      { duration: { days: 1, nights: 0 }, expected: dayTrip },
      { duration: { days: 2, nights: 1 }, expected: overnight },
      { duration: { days: 2, nights: 0 }, expected: twoDayTrip },
    ]) {
      const feed = cloneFixture(EXPERIENCE_FIXTURE);
      feed.experience.duration = duration;
      const rawData = adaptExperienceFeedV2(feed, EXPERIENCE_I18N[feed.experience.id], whatsappUrl());
      const content = toHeroContent(rawData, translator, feed.experience.pricing.depositPercent, feed.experience.duration);

      expect(content.summary).toBe(
        translate('experiences.ui.heroSummary', { duration: expected }),
      );
    }
  });
});

describe('toWidgetContent review count', () => {
  it('labels the review count when the experience has reviews', () => {
    expect(toWidgetContent(t, 5).reviewsCountLabel).toBe('experiences.ui.reviewsCountLabel:{"count":5}');
  });

  it('omits the review label when there are no reviews, so no rating is implied', () => {
    expect(toWidgetContent(t, 0).reviewsCountLabel).toBeUndefined();
  });
});
