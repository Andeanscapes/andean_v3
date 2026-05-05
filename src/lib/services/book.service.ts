/**
 * Booking Service
 *
 * Pattern: Fetch → Validate → Translate → Return
 *
 * The translation step is delegated to pure projector functions in
 * src/utils/experience.translators.ts so this file stays focused
 * on the data-access concerns: fetch, validate, compose, and return.
 */

import type { ExperienceData } from '../schemas';
import { ExperienceDataSchema } from '../schemas';
import { EXPERIENCE_DATA_REGISTRY } from '../data-mocks/experiences.registry';
import { getTranslations } from 'next-intl/server';
import {
  toTranslatedConfig,
  toHeroContent,
  toWidgetContent,
  toValuePropositionsContent,
  toInclusionsContent,
  toItineraryContent,
  toAccommodationTiersContent,
  toHostContent,
} from '@/utils/experienceTranslators';

/**
 * Fetch and translate experience data for the booking SSR page.
 */
export async function getBookingDataSSR(
  experienceId: string,
  locale: string,
): Promise<ExperienceData> {
  const t = await getTranslations({ locale });

  // 1. Fetch raw data
  // PRODUCTION: Replace getFallbackData with an API fetch:
  // const response = await fetch(`${API_BASE_URL}/api/v1/experiences/${experienceId}`, { ... });
  // const raw: unknown = await response.json();
  const raw: unknown = getFallbackData(experienceId);

  // 2. Validate — always enforced so schema drift surfaces immediately
  const result = ExperienceDataSchema.safeParse(raw);
  if (!result.success) {
    console.error(`[BookingService] Validation failed for "${experienceId}":`, result.error.format());
    throw new Error(`[BookingService] Invalid data for experience: ${experienceId}`);
  }
  const rawData = result.data;

  // 3. Translate — each projector handles one content section
  const translatedConfig = toTranslatedConfig(rawData, t);

  const translated: ExperienceData = {
    ...rawData,
    config: translatedConfig,
    transportOptions: rawData.transportOptions.map((option) => ({
      ...option,
      label: t(option.label),
      description: option.description ? t(option.description) : undefined,
    })),
    roomModes: rawData.roomModes.map((mode) => ({ ...mode, label: t(mode.label) })),
    heroContent: toHeroContent(rawData, t, rawData.config.depositPercent),
    widgetContent: toWidgetContent(t, rawData.config.reviewsCount ?? 528),
    valuePropositionsContent: toValuePropositionsContent(rawData, t),
    inclusionsContent: toInclusionsContent(rawData, t),
    itineraryContent: toItineraryContent(rawData, t),
    accommodationTiersContent: toAccommodationTiersContent(rawData, t),
    hostContent: toHostContent(rawData, t),
  };

  const translatedResult = ExperienceDataSchema.safeParse(translated);
  if (!translatedResult.success) {
    console.error(`[BookingService] Translated data validation failed for "${experienceId}":`, translatedResult.error.format());
    throw new Error(`[BookingService] Invalid translated data for experience: ${experienceId}`);
  }

  return translatedResult.data;
}

// ── Fallback registry ────────────────────────────────────────────────────────
// To add a new experience: add its mock to src/lib/data-mocks/experiences.registry.ts

function getFallbackData(experienceId: string): ExperienceData {
  const data = EXPERIENCE_DATA_REGISTRY[experienceId];
  if (!data) {
    throw new Error(`[BookingService] No fallback data for experience: "${experienceId}". Add it to EXPERIENCE_DATA_REGISTRY.`);
  }
  return data;
}
