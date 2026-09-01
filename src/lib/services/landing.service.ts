/**
 * Landing Service
 *
 * Pattern: Fetch → Validate → Translate → Return
 *
 * The translation step is delegated to pure projector functions in
 * src/utils/landingTranslators.ts so this file stays focused on
 * data-access concerns: fetch, validate, compose, and return.
 *
 * The remote feed is the only source of data — there is no local fallback, so
 * an unavailable or invalid feed fails the render rather than silently serving
 * stale content.
 */

import { getTranslations } from 'next-intl/server';
import { LandingContentSchema } from '../schemas/landing.schema';
import type { LandingContent, LandingFeed } from '../schemas/landing.schema';
import { LandingFeedV2Schema } from '../schemas/feed/v2';
import { filterCurrentAvailableDates } from '@/utils/availability';
import { adaptLandingFeedV2 } from '@/utils/landingFeedAdapter';
import { fetchRemoteJson } from '../remote-data';
import { LANDING_FEED_PATH } from '@/utils/feedPaths';
import {
  toLandingFlagshipContent,
  toLandingReviewsContent,
  toLandingFaqsContent,
  toLandingFinalCtaContent,
  toLandingHeroBrandContent,
  toLandingCategoriesContent,
  toLandingFeaturedExperiencesContent,
  toLandingWhyUsContent,
  toLandingHowItWorksContent,
  toLandingTravelerSegmentsContent,
  toLandingTrustStatsContent,
  toLandingLocationBrandContent,
  toLandingSafetyContent,
  toLandingGlobalCtasContent,
} from '@/utils/landingTranslators';

export async function getLandingDataSSR(locale: string): Promise<LandingContent> {
  const t = await getTranslations({ locale });

  // 1. Fetch and validate the v2 feed
  const remote = await fetchRemoteJson(LANDING_FEED_PATH, LandingFeedV2Schema, {
    revalidate: 3600,
    tags: ['landing-data'],
  });

  if (!remote.data) {
    throw new Error(`[LandingService] Landing feed unavailable: ${remote.reason}`);
  }

  // 2. Resolve domain codes → i18n keys and merge the frontend-owned structure.
  //    The feed carries a fixed departure list, so expired dates are dropped.
  const rawData = withCurrentDates(adaptLandingFeedV2(remote.data));

  // 3. Translate — each projector handles one content section
  const translated: LandingContent = {
    flagship: toLandingFlagshipContent(rawData, t),
    heroBrand: toLandingHeroBrandContent(rawData, t),
    categories: toLandingCategoriesContent(rawData, t),
    featuredExperiences: toLandingFeaturedExperiencesContent(rawData, t),
    whyUs: toLandingWhyUsContent(rawData, t),
    howItWorks: toLandingHowItWorksContent(rawData, t),
    travelerSegments: toLandingTravelerSegmentsContent(rawData, t),
    trustStats: toLandingTrustStatsContent(rawData, t),
    locationBrand: toLandingLocationBrandContent(rawData, t),
    safety: toLandingSafetyContent(rawData, t),
    globalCtas: toLandingGlobalCtasContent(rawData, t),
    reviews: toLandingReviewsContent(rawData, t),
    faqs: toLandingFaqsContent(rawData, t),
    finalCta: toLandingFinalCtaContent(rawData, t),
  };

  const translatedResult = LandingContentSchema.safeParse(translated);
  if (!translatedResult.success) {
    console.error('[LandingService] Translated content validation failed:', translatedResult.error.format());
    throw new Error('[LandingService] Invalid translated landing content.');
  }

  return translatedResult.data;
}

/**
 * Drop expired availability and re-derive the featured-experience
 * "next availability" hint from the surviving dates.
 */
function withCurrentDates(data: LandingFeed): LandingFeed {
  const dates = filterCurrentAvailableDates(data.flagship.availableDates);

  return {
    ...data,
    flagship: { ...data.flagship, availableDates: dates },
    featuredExperiences: {
      ...data.featuredExperiences,
      items: data.featuredExperiences.items.map((item) => ({
        ...item,
        nextAvailability: dates[0]
          ? {
              dateISO: dates[0].startDate.slice(0, 10),
              spotsLeft: dates[0].spots,
            }
          : undefined,
      })),
    },
  };
}
