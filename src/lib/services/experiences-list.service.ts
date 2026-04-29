import type { ExperienceData, ExperiencesListData } from '../schemas';
import { ExperiencesListConfigSchema } from '../schemas';
import { EXPERIENCES_LIST_CONFIG } from '../data-mocks/experiencesList.mock';
import { EXPERIENCE_DATA_REGISTRY } from '../data-mocks/experiences.registry';
import { getTranslations } from 'next-intl/server';

/**
 * Fetch and translate experiences list for SSR.
 * Pattern: Fetch -> Validate -> Translate -> Return
 *
 * PRODUCTION: The list API endpoint will return `fromPrice` per card as a
 * denormalized field (computed server-side). When that lands, remove
 * EXPERIENCE_DATA_REGISTRY and computeFromPrice — replace the mock block
 * below with a single fetch call and the price will come pre-computed.
 */
export async function getExperiencesListSSR(locale: string): Promise<ExperiencesListData> {
  const t = await getTranslations({ locale });

  // 1. Fetch raw config
  // PRODUCTION: Replace mock block with:
  // const response = await fetch(`${API_BASE_URL}/api/v1/experiences`, {
  //   next: { revalidate: 3600, tags: ['experiences-list'] },
  // });
  // const raw: unknown = await response.json();
  const raw: unknown = EXPERIENCES_LIST_CONFIG;

  // 2. Validate — always enforced
  const result = ExperiencesListConfigSchema.safeParse(raw);
  if (!result.success) {
    console.error('[ExperiencesList] Validation failed:', result.error.format());
    throw new Error('[ExperiencesList] Invalid list config structure');
  }
  const rawConfig = result.data;

  // 3. Translate cards — prices resolved synchronously from shared registry
  const cards = await Promise.all(
    rawConfig.cards.map(async (card) => {
      let price = card.price;

      if (price === undefined && card.experienceId) {
        const rawData = EXPERIENCE_DATA_REGISTRY[card.experienceId];
        price = rawData ? computeFromPrice(rawData) : 0;
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

  // 4. Return fully translated data
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

// ── Pricing helper ───────────────────────────────────────────────────────────
// Computes the "From" price per person for a list card.
// Formula: experiencePrice + cheapestTier(roomPerPerson + optionalServices) × nights
// PRODUCTION: Delete this function when the list API returns fromPrice directly.

function computeFromPrice(expData: ExperienceData): number {
  const { experiencePricePerPerson, numberOfNights } = expData.config;
  const tiers = expData.accommodationTiers;

  if (!tiers || tiers.length === 0) return experiencePricePerPerson;

  let cheapestTierCost = Infinity;

  for (const tier of tiers) {
    let cheapestRoomPerPerson = Infinity;
    for (const room of tier.rooms) {
      const perPerson = room.pricePerNight / room.capacity;
      if (perPerson < cheapestRoomPerPerson) cheapestRoomPerPerson = perPerson;
    }

    const servicesPerPerson = (tier.services ?? []).reduce(
      (sum, svc) => sum + svc.pricePerPersonPerNight,
      0,
    );

    const tierTotal = (cheapestRoomPerPerson + servicesPerPerson) * numberOfNights;
    if (tierTotal < cheapestTierCost) cheapestTierCost = tierTotal;
  }

  return experiencePricePerPerson + (cheapestTierCost === Infinity ? 0 : cheapestTierCost);
}
