import type { ExperiencesListData } from '../schemas';
import { EXPERIENCES_LIST_CONFIG } from '../data-mocks/experiencesList.mock';
import { getTranslations } from 'next-intl/server';
import { getExperienceDataByIdSSR } from './experiences-catalog.service';

/**
 * Fetch and translate experiences list for SSR.
 * Pattern: Fetch -> Validate -> Translate -> Return
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
          const expData = await getExperienceDataByIdSSR(card.experienceId, locale);
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