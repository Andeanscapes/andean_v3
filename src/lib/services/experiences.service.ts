import type { ExperienceData, ExperiencesListData } from '../schemas';
import { EMERALD_MINING_DATA } from '../data-mocks/emeraldMining.mock';
import { EXPERIENCES_LIST_CONFIG } from '../data-mocks/experiencesList.mock';
import { getTranslations } from 'next-intl/server';

/**
 * Fetch and translate experience data for SSR
 * Pattern: Fetch → Validate → Translate → Return
 * 
 * @param experienceId - Experience identifier (e.g., 'emeraldMining')
 * @param locale - Locale for translations (e.g., 'en', 'es', 'fr')
 */
export async function getExperienceDataSSR(
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

/**
 * Fetch and translate experiences list for SSR
 * Pattern: Fetch → Validate → Translate → Return
 * 
 * @param locale - Locale for translations (e.g., 'en', 'es', 'fr')
 */
export async function getExperiencesListSSR(locale: string): Promise<ExperiencesListData> {
  const t = await getTranslations({ locale });

  // 1. Fetch raw config from API
  // PRODUCTION: Uncomment the fetch below
  // const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.andeanscapes.com';
  // const response = await fetch(`${API_BASE_URL}/api/v1/experiences`, {
  //   headers: { 'Content-Type': 'application/json' },
  //   next: { revalidate: 3600, tags: ['experiences-list'] },
  // });
  // const data: unknown = await response.json();
  // const result = ExperiencesListConfigSchema.safeParse(data);
  // if (!result.success) {
  //   console.error('[ExperiencesList] Validation failed:', result.error.format());
  //   throw new Error('Invalid API response structure');
  // }
  // const rawConfig = result.data;

  // DEVELOPMENT: Use fallback data
  const rawConfig = EXPERIENCES_LIST_CONFIG;

  // 2. Translate and resolve prices
  const experiencePriceCache = new Map<string, number>();

  const cards = await Promise.all(
    rawConfig.cards.map(async (card) => {
      let price = card.price;
      
      // Dynamic price resolution if needed
      if (price === undefined && card.experienceId) {
        const cached = experiencePriceCache.get(card.experienceId);
        if (cached) {
          price = cached;
        } else {
          const expData = await getExperienceDataSSR(card.experienceId, locale);
          price = expData.config.basePricePerPerson;
          experiencePriceCache.set(card.experienceId, price);
        }
      }

      return {
        id: card.id,
        title: t(card.titleKey),
        description: t(card.descriptionKey),
        image: card.image,
        price: price ?? 0,
        priceQualifier: card.priceQualifierKey ? t(card.priceQualifierKey) : undefined,
        metadata: (card.metadataKeys ?? []).map((key) => t(key)),
        href: card.href,
        tag: t(card.tagKey),
        trust: t(card.trustKey),
      };
    })
  );

  // 3. Return fully translated data
  return {
    metaTitle: t(rawConfig.metaTitleKey),
    metaDescription: t(rawConfig.metaDescriptionKey),
    sectionTitle: t(rawConfig.sectionTitleKey),
    sectionSubtitle: t(rawConfig.sectionSubtitleKey),
    fromLabel: t(rawConfig.fromLabelKey),
    viewDetails: t(rawConfig.viewDetailsKey),
    hero: {
      title: t(rawConfig.hero.titleKey),
      subtitle: t(rawConfig.hero.subtitleKey),
      summary: t(rawConfig.hero.summaryKey),
      highlightText: t(rawConfig.hero.highlightTextKey),
      ctaLabel: t(rawConfig.hero.ctaLabelKey),
      helperText: t(rawConfig.hero.helperTextKey),
      hideCta: false,
      ctaTargetId: rawConfig.hero.ctaTargetId,
      badges: rawConfig.hero.badges.map((badge) => ({
        label: t(badge.labelKey),
        icon: badge.icon,
      })),
    },
    cards,
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
