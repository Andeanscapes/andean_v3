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

import { cache } from 'react';
import { getTranslations } from 'next-intl/server';
import { LandingContentSchema } from '../schemas/landing.schema';
import type { LandingContent, LandingFeed } from '../schemas/landing.schema';
import { LandingFeedV2Schema } from '../schemas/feed/v2';
import { filterCurrentAvailableDates } from '@/utils/availability';
import { adaptLandingFeedV2 } from '@/utils/landingFeedAdapter';
import { resolveMediaUrlsDeep } from '@/utils/mediaUrl';
import { pickHeroVariant } from '@/utils/heroVariant';
import { fetchRemoteJson } from '../remote-data';
import { LANDING_FEED_PATH } from '@/utils/feedPaths';
import { experiencePath } from '@/utils/experienceRoutes';
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

/**
 * Wrapped in React `cache`, keyed by `locale`, for the same reason as
 * `book.service` and `experiences-list.service` — plus one specific to this
 * page: the hero variant is chosen with `Math.random` per call, so two calls in
 * one request would render one image and preload another. Memoizing makes the
 * pick stable for the request that renders it.
 *
 * `cache` is inert outside a request scope, so tests are unaffected.
 */
export const getLandingDataSSR = cache(async (locale: string): Promise<LandingContent> => {
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
  //    CDN-relative media paths are resolved to absolute URLs here.
  const rawData = resolveMediaUrlsDeep(withCurrentDates(adaptLandingFeedV2(remote.data)));

  // 3. Translate — each projector handles one content section
  const translated: LandingContent = {
    flagship: toLandingFlagshipContent(rawData, t),
    heroBrand: {
      ...toLandingHeroBrandContent(rawData, t),
      backgroundImage: pickHeroVariant(
        rawData.heroBrand.backgroundImageVariants,
        rawData.heroBrand.backgroundImage,
      ),
    },
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
});

/**
 * Locale-free path of the landing flagship experience, for site chrome (the
 * footer) that deep-links into it. `@/i18n/navigation` adds the locale prefix.
 *
 * Same path, schema and cache options as `getLandingDataSSR`, so the fetch is
 * shared rather than repeated. Throws like the rest of the service layer: the
 * `[locale]` error boundary handles an unavailable feed.
 */
export const getFlagshipExperiencePathSSR = cache(async (): Promise<string> => {
  const remote = await fetchRemoteJson(LANDING_FEED_PATH, LandingFeedV2Schema, {
    revalidate: 3600,
    tags: ['landing-data'],
  });

  if (!remote.data) {
    throw new Error(`[LandingService] Landing feed unavailable: ${remote.reason}`);
  }

  const { flagshipExperienceId, experiences } = remote.data;
  const flagship = experiences.find((entry) => entry.id === flagshipExperienceId);

  if (!flagship) {
    throw new Error(
      `[LandingService] flagshipExperienceId "${flagshipExperienceId}" is not in experiences[].`,
    );
  }

  return experiencePath(flagship.slug);
});

/**
 * Drop expired availability and re-derive each featured card's
 * "next availability" hint from that experience's own surviving dates.
 */
function withCurrentDates(data: LandingFeed): LandingFeed {
  return {
    ...data,
    flagship: {
      ...data.flagship,
      availableDates: filterCurrentAvailableDates(data.flagship.availableDates),
    },
    featuredExperiences: {
      ...data.featuredExperiences,
      items: data.featuredExperiences.items.map((item) => {
        const dates = filterCurrentAvailableDates(item.availableDates);
        const next = dates[0];

        return {
          ...item,
          availableDates: dates,
          nextAvailability: next
            ? { dateISO: next.startDate.slice(0, 10), spotsLeft: next.spots }
            : undefined,
        };
      }),
    },
  };
}
