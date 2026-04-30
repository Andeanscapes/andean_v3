/**
 * Pure translation projectors for landing page data.
 *
 * Same pattern as experienceTranslators.ts:
 * each function receives raw (i18n-keyed) data + a `t` function,
 * and returns a translated, UI-ready content slice.
 */

import type { LandingDataMock, LandingContent } from '@/lib/schemas/landing.schema';

type Translator = (key: string, values?: Record<string, string | number>) => string;

// ── Flagship / Hero ──────────────────────────────────────────────────────────

export function toLandingFlagshipContent(
  raw: LandingDataMock,
  t: Translator,
): LandingContent['flagship'] {
  const { flagship } = raw;
  return {
    experienceId: flagship.experienceId,
    experienceSlug: flagship.experienceSlug,
    badge: t(flagship.badgeKey),
    title: t(flagship.titleKey),
    subtitle: t(flagship.subtitleKey),
    description: t(flagship.descriptionKey),
    backgroundImage: flagship.backgroundImage,
    mobileBackgroundImage: flagship.mobileBackgroundImage,
    valueChips: flagship.valueChips.map((chip) => ({
      ...chip,
      label: t(chip.labelKey),
    })),
    pricing: flagship.pricing,
    availableDates: flagship.availableDates,
    transportOptions: flagship.transportOptions.map((opt) => ({
      value: opt.value,
      label: t(opt.labelKey),
    })),
    maxPeople: flagship.maxPeople,
    minPeople: flagship.minPeople,
    whatsappLink: flagship.whatsappLink,
    reviewsCount: flagship.reviewsCount,
    reviewsRating: flagship.reviewsRating,
    labels: {
      fromLabel: t('Landing.filters.fromLabel'),
      perPersonLabel: t('Landing.filters.perPersonLabel'),
      reviewsCountLabel: t('Landing.filters.reviewsCountLabel', { count: flagship.reviewsCount }),
      selectDateLabel: t('Landing.filters.selectDateLabel'),
      peopleLabel: t('Landing.filters.peopleLabel'),
      arrivalLabel: t('Landing.filters.arrivalLabel'),
      ctaLabel: t('Landing.filters.ctaLabel', { percent: flagship.pricing.depositPercent }),
      depositNoteLabel: t('Landing.filters.depositNoteLabel', {
        percent: flagship.pricing.depositPercent,
      }),
      trustSecureLabel: t('Landing.filters.trustSecure'),
      trustCancellationLabel: t('Landing.filters.trustCancellation'),
      trustVerifiedLabel: t('Landing.filters.trustVerified'),
      whatsappCtaLabel: t('Landing.filters.whatsappCta'),
      fallbackDateLabel: t('Landing.filters.fallbackDate'),
    },
  };
}

// ── Value Propositions ───────────────────────────────────────────────────────

export function toLandingValuePropsContent(
  raw: LandingDataMock,
  t: Translator,
): LandingContent['valueProps'] {
  return {
    title: t(raw.valueProps.titleKey),
    items: raw.valueProps.items.map((item) => ({
      id: item.id,
      title: t(item.titleKey),
      description: t(item.descriptionKey),
      imageUrl: item.imageUrl,
      badge: item.badgeKey ? t(item.badgeKey) : undefined,
    })),
  };
}

// ── Inclusions ───────────────────────────────────────────────────────────────

export function toLandingInclusionsContent(
  raw: LandingDataMock,
  t: Translator,
): LandingContent['inclusions'] {
  const { inclusions } = raw;
  return {
    sectionTitle: t(inclusions.sectionTitleKey),
    includedLabel: t(inclusions.includedLabelKey),
    notIncludedLabel: t(inclusions.notIncludedLabelKey),
    logistics: inclusions.logistics.map((item) => ({
      ...item,
      label: t(item.labelKey),
    })),
    included: inclusions.included.map((item) => ({
      id: item.id,
      title: t(item.titleKey),
    })),
    notIncluded: inclusions.notIncluded.map((item) => ({
      id: item.id,
      title: t(item.titleKey),
    })),
    location: inclusions.location,
  };
}

// ── Tiers ────────────────────────────────────────────────────────────────────

export function toLandingTiersContent(
  raw: LandingDataMock,
  t: Translator,
): LandingContent['tiers'] {
  return {
    sectionTitle: t(raw.tiers.sectionTitleKey),
    items: raw.tiers.items.map((item) => ({
      id: item.id,
      label: t(item.labelKey),
      description: t(item.descriptionKey),
      tag: t(item.tagKey),
      isBestSeller: item.isBestSeller,
      images: item.images,
      fromAmount: item.fromAmount,
      href: item.href,
      ctaLabel: t(item.ctaLabelKey),
    })),
  };
}

// ── Reviews ──────────────────────────────────────────────────────────────────

export function toLandingReviewsContent(
  raw: LandingDataMock,
  t: Translator,
): LandingContent['reviews'] {
  const { reviews } = raw;
  return {
    sectionTitle: t(reviews.sectionTitleKey),
    subtitle: t(reviews.subtitleKey),
    eyebrow: t('Landing.reviews.eyebrow'),
    outOf5Aria: t('Landing.reviews.outOf5Aria'),
    countSuffix: t('Landing.reviews.countSuffix'),
    items: reviews.items.map((item) => ({
      id: item.id,
      name: item.name,
      country: item.country,
      countryFlag: item.countryFlag,
      rating: item.rating,
      comment: t(item.commentKey),
      avatarUrl: item.avatarUrl,
    })),
    trustPanel: {
      title: t(reviews.trustPanel.titleKey),
      bullets: reviews.trustPanel.bullets.map((b) => ({
        id: b.id,
        iconName: b.iconName,
        text: t(b.textKey),
      })),
    },
    aggregateRating: reviews.aggregateRating,
  };
}

// ── FAQs ─────────────────────────────────────────────────────────────────────

export function toLandingFaqsContent(
  raw: LandingDataMock,
  t: Translator,
): LandingContent['faqs'] {
  return {
    sectionTitle: t(raw.faqs.sectionTitleKey),
    items: raw.faqs.items.map((item) => ({
      id: item.id,
      question: t(item.questionKey),
      answer: t(item.answerKey),
    })),
  };
}

// ── Final CTA ─────────────────────────────────────────────────────────────────

export function toLandingFinalCtaContent(
  raw: LandingDataMock,
  t: Translator,
): LandingContent['finalCta'] {
  const { finalCta } = raw;
  return {
    sectionTitle: t(finalCta.sectionTitleKey),
    subtitle: t(finalCta.subtitleKey),
    backgroundImage: finalCta.backgroundImage,
    bookAria: t('Landing.finalCta.bookAria'),
    primaryCtaLabel: t(finalCta.primaryCtaLabelKey),
    primaryCtaHref: finalCta.primaryCtaHref,
    secondaryCtaLabel: t(finalCta.secondaryCtaLabelKey),
    trustBadges: finalCta.trustBadges.map((b) => ({
      id: b.id,
      iconName: b.iconName,
      label: t(b.labelKey),
    })),
  };
}

// ── Brand-level Hero ─────────────────────────────────────────────────────────

export function toLandingHeroBrandContent(
  raw: LandingDataMock,
  t: Translator,
): LandingContent['heroBrand'] {
  const { heroBrand } = raw;
  return {
    eyebrow: t(heroBrand.eyebrowKey),
    title: t(heroBrand.titleKey),
    subtitle: t(heroBrand.subtitleKey),
    description: t(heroBrand.descriptionKey),
    backgroundImage: heroBrand.backgroundImage,
    mobileBackgroundImage: heroBrand.mobileBackgroundImage,
    primaryCtaLabel: t(heroBrand.primaryCtaLabelKey),
    primaryCtaHref: heroBrand.primaryCtaHref,
    secondaryCtaLabel: t(heroBrand.secondaryCtaLabelKey),
    secondaryCtaHref: heroBrand.secondaryCtaHref,
    trustChips: heroBrand.trustChips.map((chip) => ({
      id: chip.id,
      iconName: chip.iconName,
      label: t(chip.labelKey),
    })),
    search: {
      destinationLabel: t(heroBrand.search.destinationLabelKey),
      experienceTypeLabel: t(heroBrand.search.experienceTypeLabelKey),
      durationLabel: t(heroBrand.search.durationLabelKey),
      submitLabel: t(heroBrand.search.submitLabelKey),
      submitHref: heroBrand.search.submitHref,
      destinations: heroBrand.search.destinations.map((d) => ({
        value: d.value,
        label: t(d.labelKey),
      })),
      experienceTypes: heroBrand.search.experienceTypes.map((e) => ({
        value: e.value,
        label: t(e.labelKey),
      })),
      durations: heroBrand.search.durations.map((d) => ({
        value: d.value,
        label: t(d.labelKey),
      })),
    },
  };
}

// ── Categories ───────────────────────────────────────────────────────────────

export function toLandingCategoriesContent(
  raw: LandingDataMock,
  t: Translator,
): LandingContent['categories'] {
  return {
    sectionTitle: t(raw.categories.sectionTitleKey),
    items: raw.categories.items.map((item) => ({
      id: item.id,
      iconName: item.iconName,
      title: t(item.titleKey),
      description: t(item.descriptionKey),
      imageUrl: item.imageUrl,
      href: item.href,
      ctaLabel: t(item.ctaLabelKey),
    })),
  };
}

// ── Featured Experiences (inline data, no catalog dep) ──────────────────────

export function toLandingFeaturedExperiencesContent(
  raw: LandingDataMock,
  t: Translator,
): LandingContent['featuredExperiences'] {
  const fromLabel = t('Landing.brand.featured.fromLabel');
  const viewDetailsLabel = t('Landing.brand.featured.viewDetails');

  return {
    sectionTitle: t(raw.featuredExperiences.sectionTitleKey),
    viewAllLabel: t(raw.featuredExperiences.viewAllLabelKey),
    viewAllHref: raw.featuredExperiences.viewAllHref,
    items: raw.featuredExperiences.items.map((item) => ({
      id: item.id,
      experienceSlug: item.experienceSlug,
      title: t(item.titleKey),
      description: t(item.descriptionKey),
      image: item.image,
      href: item.href,
      badge: item.badgeKey ? t(item.badgeKey) : undefined,
      duration: t(item.durationKey),
      location: t(item.locationKey),
      fromAmount: item.fromAmount,
      currency: item.currency,
      fromLabel,
      viewDetailsLabel,
    })),
  };
}

// ── Why Us ───────────────────────────────────────────────────────────────────

export function toLandingWhyUsContent(
  raw: LandingDataMock,
  t: Translator,
): LandingContent['whyUs'] {
  return {
    sectionTitle: t(raw.whyUs.sectionTitleKey),
    lead: t(raw.whyUs.leadKey),
    items: raw.whyUs.items.map((item) => ({
      id: item.id,
      iconName: item.iconName,
      title: t(item.titleKey),
      description: t(item.descriptionKey),
    })),
  };
}

// ── How It Works ─────────────────────────────────────────────────────────────

export function toLandingHowItWorksContent(
  raw: LandingDataMock,
  t: Translator,
): LandingContent['howItWorks'] {
  return {
    sectionTitle: t(raw.howItWorks.sectionTitleKey),
    steps: raw.howItWorks.steps.map((step) => ({
      id: step.id,
      iconName: step.iconName,
      title: t(step.titleKey),
      description: t(step.descriptionKey),
    })),
  };
}

// ── Traveler Segments ────────────────────────────────────────────────────────

export function toLandingTravelerSegmentsContent(
  raw: LandingDataMock,
  t: Translator,
): LandingContent['travelerSegments'] {
  return {
    sectionTitle: t(raw.travelerSegments.sectionTitleKey),
    segments: raw.travelerSegments.segments.map((seg) => ({
      id: seg.id,
      iconName: seg.iconName,
      label: t(seg.labelKey),
      recommendation: t(seg.recommendationKey),
      ctaLabel: t(seg.ctaLabelKey),
      ctaHref: seg.ctaHref,
    })),
  };
}

// ── Trust Stats ──────────────────────────────────────────────────────────────

export function toLandingTrustStatsContent(
  raw: LandingDataMock,
  t: Translator,
): LandingContent['trustStats'] {
  return {
    srTitle: t('Landing.brand.trustStats.srTitle'),
    items: raw.trustStats.items.map((item) => ({
      id: item.id,
      value: item.value,
      label: t(item.labelKey),
    })),
  };
}

// ── Location (brand) ─────────────────────────────────────────────────────────

export function toLandingLocationBrandContent(
  raw: LandingDataMock,
  t: Translator,
): LandingContent['locationBrand'] {
  const { locationBrand } = raw;
  return {
    sectionTitle: t(locationBrand.sectionTitleKey),
    mapImage: locationBrand.mapImage,
    mapImageAlt: t(locationBrand.mapImageAltKey),
    bullets: locationBrand.bullets.map((b) => ({
      id: b.id,
      iconName: b.iconName,
      label: t(b.labelKey),
    })),
    ctaLabel: t(locationBrand.ctaLabelKey),
    ctaHref: locationBrand.ctaHref,
  };
}

// ── Safety ───────────────────────────────────────────────────────────────────

export function toLandingSafetyContent(
  raw: LandingDataMock,
  t: Translator,
): LandingContent['safety'] {
  return {
    sectionTitle: t(raw.safety.sectionTitleKey),
    lead: t(raw.safety.leadKey),
    items: raw.safety.items.map((item) => ({
      id: item.id,
      iconName: item.iconName,
      title: t(item.titleKey),
    })),
  };
}

// ── Global CTAs ──────────────────────────────────────────────────────────────

export function toLandingGlobalCtasContent(
  raw: LandingDataMock,
  t: Translator,
): LandingContent['globalCtas'] {
  return {
    exploreHref: raw.globalCtas.exploreHref,
    whatsappHref: raw.globalCtas.whatsappHref,
    fromAmount: raw.globalCtas.fromAmount,
    currency: raw.globalCtas.currency,
    exploreLabel: t('Landing.brand.globalCtas.explore'),
    whatsappLabel: t('Landing.brand.globalCtas.whatsapp'),
    mobileFromLabel: t('Landing.brand.globalCtas.mobileFromLabel'),
  };
}
