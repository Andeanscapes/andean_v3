/**
 * Landing Service
 *
 * Pattern: Fetch → Validate → Translate → Return
 *
 * The translation step is delegated to pure projector functions in
 * src/utils/landingTranslators.ts so this file stays focused on
 * data-access concerns: fetch, validate, compose, and return.
 *
 * PRODUCTION: Replace getFallbackData with:
 * const raw: unknown = await fetch(`${API_BASE_URL}/api/v1/landing`).then(r => r.json());
 */

import { getTranslations } from 'next-intl/server';
import { LandingContentSchema, LandingDataMockSchema } from '../schemas/landing.schema';
import type { LandingContent } from '../schemas/landing.schema';
import { LANDING_DATA_REGISTRY } from '../data-mocks/landing.registry';
import {
  toLandingFlagshipContent,
  toLandingValuePropsContent,
  toLandingInclusionsContent,
  toLandingTiersContent,
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

  // 1. Fetch raw data
  const raw: unknown = LANDING_DATA_REGISTRY['default'];

  // 2. Validate — schema drift surfaces immediately
  const result = LandingDataMockSchema.safeParse(raw);
  if (!result.success) {
    console.error('[LandingService] Validation failed:', result.error.format());
    throw new Error('[LandingService] Invalid landing data in registry.');
  }
  const rawData = result.data;

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
    valueProps: toLandingValuePropsContent(rawData, t),
    inclusions: toLandingInclusionsContent(rawData, t),
    tiers: toLandingTiersContent(rawData, t),
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
