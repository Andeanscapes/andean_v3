/**
 * Pure translation projectors for experience data.
 *
 * Each function takes raw (i18n-keyed) data and a `t` function,
 * and returns a translated, UI-ready content shape.
 *
 * Keeping translation logic here means book.service only needs to
 * orchestrate: fetch → validate → compose translators → return.
 */

import type {
  ExperienceData,
  ExperienceHeroContent,
  ExperienceWidgetContent,
  ValuePropositionsContent,
  ExperienceInclusionsContent,
  AccommodationTiersContent,
  HostContent,
  ItineraryContent,
} from '@/lib/schemas';

// next-intl server `t` signature
type Translator = (key: string, values?: Record<string, string | number>) => string;

function translateMaybeKey(value: string, t: Translator): string {
  return value.includes('.') ? t(value) : value;
}

// ── Hero ────────────────────────────────────────────────────────────────────

export function toHeroContent(
  rawData: ExperienceData,
  t: Translator,
  depositPercent: number,
): ExperienceHeroContent {
  const { config } = rawData;
  return {
    title: t(config.title),
    subtitle: t(config.subtitle),
    summary: t('experiences.ui.heroSummary'),
    highlightText: `${t('experiences.ui.limitedSpots')} · ${t('experiences.ui.depositLabel')} ${depositPercent}%`,
    ctaLabel: t('experiences.ui.heroCta'),
    helperText: t('experiences.common.security'),
    hideCta: false,
    ctaTargetId: 'available-dates',
    backgroundImageUrl: config.images?.heroBackground ?? '/assets/images/hero/h10.webp',
    badges: [
      { label: t('experiences.ui.limitedSpots'), icon: 'limited' },
      { label: `${t('experiences.ui.depositLabel')} ${depositPercent}%`, icon: 'deposit' },
    ],
  };
}

// ── Widget ───────────────────────────────────────────────────────────────────

export function toWidgetContent(
  t: Translator,
  reviewsCount: number,
): ExperienceWidgetContent {
  return {
    onSelectedDatesLabel: t('experiences.ui.onSelectedDates'),
    selectDateLabel: t('experiences.ui.experienceDetails.selectDate'),
    peopleLabel: t('experiences.ui.peopleLabel'),
    roomTypeLabel: t('experiences.ui.roomType'),
    howToArriveLabel: t('experiences.ui.howToArrive'),
    checkDatesButtonLabel: t('experiences.ui.experienceDetails.checkDatesBtn'),
    securityLine: t('experiences.common.security'),
    freeCancellationLine: t('experiences.ui.freeCancellation'),
    verifiedReviewsLine: t('experiences.ui.verifiedReviews'),
    whatsappCtaLabel: t('BookingCtas.whatsappCta'),
    fallbackDateLabel: t('experiences.ui.availableDates'),
    topSellerLabel: t('experiences.ui.topSellerLabel'),
    fromLabel: t('experiences.ui.fromLabel'),
    totalLabel: t('experiences.ui.totalLabel'),
    perPersonLabel: t('experiences.ui.perPersonLabel'),
    reviewsCountLabel: t('experiences.ui.reviewsCountLabel', { count: reviewsCount }),
    bookingButtonLabel: t('experiences.ui.experienceDetails.bookNowBtn'),
    cardBackgroundGradient: 'rgba(10, 25, 47, 0.85)',
  };
}

// ── Value Propositions ───────────────────────────────────────────────────────

export function toValuePropositionsContent(
  rawData: ExperienceData,
  t: Translator,
): ValuePropositionsContent {
  const { config } = rawData;
  return {
    title: t('experiences.ui.experienceDetails.valuePropositionsTitle'),
    items: [
      {
        id: 'tile-1',
        title: t('experiences.ui.experienceDetails.tile1Title'),
        description: t('experiences.ui.experienceDetails.tile1Desc'),
        imageUrl: config.images?.valuePropositionTile1 ?? '/assets/images/hero/h10.webp',
        badge: t('experiences.ui.verifiedGuideBadge'),
      },
      {
        id: 'tile-2',
        title: t('experiences.ui.experienceDetails.tile2Title'),
        description: t('experiences.ui.experienceDetails.tile2Desc'),
        imageUrl: config.images?.valuePropositionTile2 ?? '/assets/images/hero/h7.webp',
      },
      {
        id: 'tile-3',
        title: t('experiences.ui.experienceDetails.tile3Title'),
        description: t('experiences.ui.experienceDetails.tile3Desc'),
        imageUrl: config.images?.valuePropositionTile3 ?? '/assets/images/hero/h8.webp',
      },
    ],
  };
}

// ── Inclusions ───────────────────────────────────────────────────────────────

export function toInclusionsContent(
  rawData: ExperienceData,
  t: Translator,
): ExperienceInclusionsContent | undefined {
  const { config } = rawData;
  if (!config.logistics || !config.included || !config.notIncluded) return undefined;

  return {
    sectionTitle: t('experiences.ui.experienceDetails.tripLogisticsTitle'),
    includedLabel: t('experiences.ui.experienceDetails.includedLabel'),
    notIncludedLabel: t('experiences.ui.experienceDetails.notIncludedLabel'),
    logistics: config.logistics.map((item) => ({
      ...item,
      label: t(item.label),
      value: item.value ? translateMaybeKey(item.value, t) : undefined,
    })),
    included: config.included.map((item) => ({ ...item, title: t(item.title) })),
    notIncluded: config.notIncluded.map((item) => ({ ...item, title: t(item.title) })),
    location: config.location,
  };
}

// ── Accommodation Tiers ──────────────────────────────────────────────────────

export function toAccommodationTiersContent(
  rawData: ExperienceData,
  t: Translator,
): AccommodationTiersContent | undefined {
  if (!rawData.accommodationTiers) return undefined;

  return {
    sectionTitle: t('experiences.ui.experienceDetails.accommodationTitle'),
    tiers: rawData.accommodationTiers.map((tier) => ({
      id: tier.id,
      tierTag: t(tier.tierTag),
      tierLabel: t(tier.tierLabel),
      tierDescription: t(tier.tierDescription),
      isHostChoice: tier.isHostChoice,
      images: tier.images,
      quickSpecs: tier.quickSpecs,
      rooms: tier.rooms.map((room) => ({ ...room, label: t(room.label) })),
      services: tier.services?.map((svc) => ({ ...svc, label: t(svc.label) })),
      roundtripTransfer: tier.roundtripTransfer,
      itinerary: tier.itinerary?.map((day) => ({
        day: day.day,
        label: t(day.label),
        stops: day.stops.map((stop) => ({
          ...stop,
          title: t(stop.title),
          shortDescription: stop.shortDescription ? t(stop.shortDescription) : undefined,
          description: stop.description ? t(stop.description) : undefined,
          notes: stop.notes?.map((note) => t(note)),
        })),
      })),
      tierNote: tier.tierNote ? t(tier.tierNote) : undefined,
      idealForItems: tier.idealForItems?.map((key) => t(key)),
      goodToKnowItems: tier.goodToKnowItems?.map((key) => t(key)),
    })),
  };
}

// ── Host ─────────────────────────────────────────────────────────────────────

export function toHostContent(
  rawData: ExperienceData,
  t: Translator,
): HostContent | undefined {
  const { host } = rawData.config;
  if (!host) return undefined;

  return {
    sectionTitle: t('experiences.ui.experienceDetails.hostPreparationTitle'),
    name: host.name,
    avatarUrl: host.avatarUrl,
    bio: t(host.bio),
    verifiedBadgeLabel: t('experiences.ui.verifiedGuideBadge'),
    idealForLabel: t('experiences.ui.experienceDetails.idealFor'),
    idealForItems: host.idealForItems.map((key) => t(key)),
    goodToKnowLabel: t('experiences.ui.experienceDetails.goodToKnow'),
    goodToKnowItems: host.goodToKnowItems.map((key) => t(key)),
  };
}

// ── Itinerary ────────────────────────────────────────────────────────────────

export function toItineraryContent(
  rawData: ExperienceData,
  t: Translator,
): ItineraryContent | undefined {
  const sectionTitle = t('experiences.ui.experienceDetails.itineraryTitle');

  // Prefer config-level itinerary (backward compat)
  if (rawData.config.itinerary) {
    return {
      sectionTitle,
      days: rawData.config.itinerary.map((day) => ({
        day: day.day,
        label: t(day.label),
        stops: day.stops.map((stop) => ({
          ...stop,
          title: t(stop.title),
          shortDescription: stop.shortDescription ? t(stop.shortDescription) : undefined,
          description: stop.description ? t(stop.description) : undefined,
          notes: stop.notes?.map((note) => t(note)),
        })),
      })),
    };
  }

  // Fall back to host-choice tier (or first tier) for the section title default
  const fallbackTier =
    rawData.accommodationTiers?.find((tier) => tier.isHostChoice) ??
    rawData.accommodationTiers?.[0];

  if (fallbackTier?.itinerary) {
    return {
      sectionTitle,
      days: fallbackTier.itinerary.map((day) => ({
        day: day.day,
        label: t(day.label),
        stops: day.stops.map((stop) => ({
          ...stop,
          title: t(stop.title),
          shortDescription: stop.shortDescription ? t(stop.shortDescription) : undefined,
          description: stop.description ? t(stop.description) : undefined,
          notes: stop.notes?.map((note) => t(note)),
        })),
      })),
    };
  }

  return undefined;
}

// ── Config translation ───────────────────────────────────────────────────────

export function toTranslatedConfig(
  rawData: ExperienceData,
  t: Translator,
): ExperienceData['config'] {
  const { config } = rawData;
  return {
    ...config,
    title: t(config.title),
    subtitle: t(config.subtitle),
    description: t(config.description),
    includesItems: (config.includesItems ?? []).map((key) => t(key)),
    includesFullDetails: config.includesFullDetails ? t(config.includesFullDetails) : '',
    microcopy: {
      deposit: t(config.microcopy.deposit),
      balance: t(config.microcopy.balance),
      security: t(config.microcopy.security),
      ctaPrimary: t(config.microcopy.ctaPrimary),
      ctaSecondary: t(config.microcopy.ctaSecondary),
    },
  };
}
