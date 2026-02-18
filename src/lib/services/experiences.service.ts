import type { ExperienceData } from '../experiences/types';
import { EMERALD_MINING_DATA } from '../experiences-config/emeraldMining.config';
import { getTranslations } from 'next-intl/server';

/**
 * Translates ExperienceData using next-intl
 * Replaces translation keys with actual translated text
 */
async function translateExperienceData(
  data: ExperienceData,
  locale: string
): Promise<ExperienceData> {
  const t = await getTranslations({ locale });

  return {
    ...data,
    config: {
      ...data.config,
      title: t(data.config.title),
      subtitle: t(data.config.subtitle),
      description: t(data.config.description),
      includesItems: data.config.includesItems.map((key) => t(key)),
      includesFullDetails: t(data.config.includesFullDetails),
      microcopy: {
        deposit: t(data.config.microcopy.deposit),
        balance: t(data.config.microcopy.balance),
        security: t(data.config.microcopy.security),
        ctaPrimary: t(data.config.microcopy.ctaPrimary),
        ctaSecondary: t(data.config.microcopy.ctaSecondary),
      },
    },
    transportOptions: data.transportOptions.map((option) => ({
      ...option,
      label: t(option.label),
      description: t(option.description),
    })),
    roomModes: data.roomModes.map((mode) => ({
      ...mode,
      label: t(mode.label),
    })),
  };
}

/**
 * Mock service - simulates fetching experience data from API
 * TODO: Replace with real API call when backend is ready
 * 
 * Example future implementation:
 * ```
 * const response = await fetch(`/api/experiences/${experienceId}?locale=${locale}`);
 * return response.json(); // API returns translated data
 * ```
 */
export async function getExperienceData(
  experienceId: string
): Promise<ExperienceData> {
  // Simulate API delay (remove in production)
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Mock data based on experienceId
  switch (experienceId) {
    case 'emeraldMining':
      return EMERALD_MINING_DATA;

    // Add more experiences here as needed
    // case 'pottery':
    //   return POTTERY_DATA;

    default:
      throw new Error(`Experience not found: ${experienceId}`);
  }
}

/**
 * Server-side data fetching with translations (for SSR)
 * Can be called in Server Components
 * 
 * @param experienceId - The ID of the experience
 * @param locale - The locale for translations (e.g., 'es', 'en', 'fr')
 * @returns Translated experience data ready for client consumption
 */
export async function getExperienceDataSSR(
  experienceId: string,
  locale: string
): Promise<ExperienceData> {
  try {
    const rawData = await getExperienceData(experienceId);
    const translatedData = await translateExperienceData(rawData, locale);
    return translatedData;
  } catch (error) {
    console.error('[ExperienceService] Error fetching data:', error);
    throw error;
  }
}
