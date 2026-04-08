/**
 * Booking Service
 *
 * Responsible for fetching, validating, and translating
 * experience data specifically for the booking flow.
 *
 * Pattern:
 * 1. Fetch data (with fallback for development)
 * 2. Validate with Zod
 * 3. Translate content
 * 4. Return ready-to-render data
 */

import type { ExperienceData } from '../schemas';
import { EMERALD_MINING_DATA } from '../data-mocks/emeraldMining.booking.mock';
import { getTranslations } from 'next-intl/server';

/**
 * Fetch and translate experience data for the booking SSR page.
 * Pattern: Fetch → Validate → Translate → Return
 *
 * @param experienceId - Experience identifier (e.g., 'emeraldMining')
 * @param locale - Locale for translations (e.g., 'en', 'es', 'fr')
 */
export async function getBookingDataSSR(
  experienceId: string,
  locale: string
): Promise<ExperienceData> {
  const t = await getTranslations({ locale });

  // 1. Fetch raw data from API
  // PRODUCTION: Uncomment the fetch below
  // const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.andeanscapes.com';
  // const response = await fetch(`${API_BASE_URL}/api/v1/experiences/${experienceId}`, {
  //   headers: { 'Content-Type': 'application/json' },
  //   next: { revalidate: 3600, tags: ['experience', experienceId] },
  // });
  // const data: unknown = await response.json();
  // const result = ExperienceDataSchema.safeParse(data);
  // if (!result.success) {
  //   console.error('[Experience] Validation failed:', result.error.format());
  //   throw new Error('Invalid API response structure');
  // }
  // const rawData = result.data;

  // DEVELOPMENT: Use fallback data
  const rawData = getFallbackData(experienceId);

  // 2. Translate all content
  const depositPercent = rawData.config.depositPercent;

  const translatedConfig = {
    ...rawData.config,
    title: t(rawData.config.title),
    subtitle: t(rawData.config.subtitle),
    description: t(rawData.config.description),
    includesItems: rawData.config.includesItems.map((key) => t(key)),
    includesFullDetails: t(rawData.config.includesFullDetails),
    microcopy: {
      deposit: t(rawData.config.microcopy.deposit),
      balance: t(rawData.config.microcopy.balance),
      security: t(rawData.config.microcopy.security),
      ctaPrimary: t(rawData.config.microcopy.ctaPrimary),
      ctaSecondary: t(rawData.config.microcopy.ctaSecondary),
    },
  };

  // 3. Return fully translated data
  return {
    ...rawData,
    config: translatedConfig,
    transportOptions: rawData.transportOptions.map((option) => ({
      ...option,
      label: t(option.label),
      description: t(option.description),
    })),
    roomModes: rawData.roomModes.map((mode) => ({
      ...mode,
      label: t(mode.label),
    })),
    heroContent: {
      title: translatedConfig.title,
      subtitle: translatedConfig.subtitle,
      summary: t('experiences.ui.heroSummary'),
      highlightText: `${t('experiences.ui.limitedSpots')} · ${t('experiences.ui.depositLabel')} ${depositPercent}%`,
      ctaLabel: t('experiences.ui.heroCta'),
      helperText: t('experiences.common.security'),
      hideCta: false,
      ctaTargetId: 'available-dates',
      badges: [
        { label: t('experiences.ui.limitedSpots'), icon: 'limited' },
        { label: `${t('experiences.ui.depositLabel')} ${depositPercent}%`, icon: 'deposit' },
      ],
    },
  };
}

// Fallback data registry
function getFallbackData(experienceId: string): ExperienceData {
  switch (experienceId) {
    case 'emeraldMining':
      return EMERALD_MINING_DATA;
    default:
      throw new Error(`No fallback data for: ${experienceId}`);
  }
}
