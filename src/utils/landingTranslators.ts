/**
 * Pure translation projectors for landing page data.
 *
 * Same pattern as experienceTranslators.ts:
 * each function receives raw (i18n-keyed) data + a `t` function,
 * and returns a translated, UI-ready content slice.
 */

import type { LandingFeed, LandingContent } from '@/lib/schemas/landing.schema';
import { toPackageTags } from '@/utils/packageTags';

type Translator = (key: string, values?: Record<string, string | number>) => string;

// ── Flagship / Hero ──────────────────────────────────────────────────────────

export function toLandingFlagshipContent(
  raw: LandingFeed,
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
    packageTags: toPackageTags(flagship.packageTags, t),
    valueChips: flagship.valueChips.map((chip) => ({
      ...chip,
      label: t(chip.labelKey),
    })),
    pricing: flagship.pricing,
    availableDates: flagship.availableDates,
    transportOptions: flagship.transportOptions?.map((opt) => ({
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
      ctaLabel: t('Landing.filters.ctaLabel'),
      // Suppressed rather than defaulted: "0% deposit to confirm" would be a
      // wrong commercial term, and the projection may omit the percentage.
      depositNoteLabel:
        flagship.pricing.depositPercent === undefined
          ? ''
          : t('Landing.filters.depositNoteLabel', { percent: flagship.pricing.depositPercent }),
      trustSecureLabel: t('Landing.filters.trustSecure'),
      trustCancellationLabel: t('Landing.filters.trustCancellation'),
      trustVerifiedLabel: t('Landing.filters.trustVerified'),
      whatsappCtaLabel: t('Landing.filters.whatsappCta'),
      fallbackDateLabel: t('Landing.filters.fallbackDate'),
    },
  };
}

// ── Value Propositions ───────────────────────────────────────────────────────

// ── Inclusions ───────────────────────────────────────────────────────────────

// ── Tiers ────────────────────────────────────────────────────────────────────

// ── Reviews ──────────────────────────────────────────────────────────────────

export function toLandingReviewsContent(
  raw: LandingFeed,
  t: Translator,
): LandingContent['reviews'] {
  const { reviews } = raw;
  return {
    sectionTitle: t(reviews.sectionTitleKey),
    subtitle: t(reviews.subtitleKey),
    outOf5Aria: t('Landing.reviews.outOf5Aria'),
    ratingSource: t('Landing.reviews.ratingSource'),
    readMore: t('Landing.reviews.readMore'),
    readLess: t('Landing.reviews.readLess'),
    items: reviews.items.map((item) => ({
      id: item.id,
      name: item.name,
      country: item.countryKey ? t(item.countryKey) : undefined,
      countryFlag: item.countryFlag,
      rating: item.rating,
      comment: t(item.commentKey),
      headline: item.headlineKey ? t(item.headlineKey) : undefined,
      avatarUrl: item.avatarUrl,
      isVerified: item.isVerified,
      verifiedExperience: item.verifiedExperienceKey ? t(item.verifiedExperienceKey) : undefined,
      sourceUrl: item.sourceUrl,
      sourceLogo: item.sourceLogo,
    })),
    aggregateRating: reviews.aggregateRating,
    platformsTitle: t(reviews.platformsTitleKey),
    platforms: reviews.platforms.map((platform) => ({
      id: platform.id,
      href: platform.href,
      logo: platform.logo,
      label: t(platform.labelKey),
      cta: t(platform.ctaKey),
      opensInNewTab: t('Landing.reviews.opensInNewTab'),
    })),
  };
}

// ── FAQs ─────────────────────────────────────────────────────────────────────

export function toLandingFaqsContent(
  raw: LandingFeed,
  t: Translator,
): LandingContent['faqs'] {
  return {
    title: t(raw.faqs.titleKey),
    description: t(raw.faqs.descriptionKey),
    enquiryTitle: t(raw.faqs.enquiryTitleKey),
    enquiryDescription: t(raw.faqs.enquiryDescriptionKey),
    planImage: raw.faqs.planImage,
    planImageAlt: t(raw.faqs.planImageAltKey),
    items: raw.faqs.items.map((item) => ({
      id: item.id,
      question: t(item.questionKey),
      answer: t(item.answerKey),
    })),
  };
}

// ── Final CTA ─────────────────────────────────────────────────────────────────

export function toLandingFinalCtaContent(
  raw: LandingFeed,
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
  };
}

// ── Brand-level Hero ─────────────────────────────────────────────────────────

export function toLandingHeroBrandContent(
  raw: LandingFeed,
  t: Translator,
): LandingContent['heroBrand'] {
  const { heroBrand } = raw;
  return {
    eyebrow: t(heroBrand.eyebrowKey),
    title: t(heroBrand.titleKey),
    subtitle: t(heroBrand.subtitleKey),
    description: t(heroBrand.descriptionKey),
    backgroundImage: heroBrand.backgroundImage,
    primaryCtaLabel: t(heroBrand.primaryCtaLabelKey),
    primaryCtaHref: heroBrand.primaryCtaHref,
    secondaryCtaLabel: t(heroBrand.secondaryCtaLabelKey),
    secondaryCtaHref: heroBrand.secondaryCtaHref,
    trustChips: heroBrand.trustChips.map((chip) => ({
      id: chip.id,
      iconName: chip.iconName,
      label: t(chip.labelKey),
    })),
    bookingCard: {
      reserveLabel: t(heroBrand.bookingCard.reserveLabelKey),
      askFirstLabel: t(heroBrand.bookingCard.askFirstLabelKey),
      nextAvailabilityLabel: t(heroBrand.bookingCard.nextAvailabilityLabelKey),
    },
    search: heroBrand.search
      ? {
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
        }
      : undefined,
  };
}

// ── Categories ───────────────────────────────────────────────────────────────

export function toLandingCategoriesContent(
  raw: LandingFeed,
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
      exclusiveAccess: item.exclusiveAccessKey ? t(item.exclusiveAccessKey) : undefined,
    })),
  };
}

// ── Featured Experiences (inline data, no catalog dep) ──────────────────────

export function toLandingFeaturedExperiencesContent(
  raw: LandingFeed,
  t: Translator,
): LandingContent['featuredExperiences'] {
  const fromLabel = t('Landing.brand.featured.fromLabel');
  const perPersonLabel = t('Landing.brand.featured.perPersonLabel');
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
      images: item.images,
      planBadge: item.planBadge ? { code: item.planBadge.code, label: t(item.planBadge.labelKey) } : undefined,
      mineBadge: item.mineBadge ? { code: item.mineBadge.code, label: t(item.mineBadge.labelKey) } : undefined,
      privateBadge: item.privateBadge ? { label: t(item.privateBadge.labelKey) } : undefined,
      href: item.href,
      duration: t(item.durationKey, item.durationValues),
      location: t(item.locationKey, item.locationValues),
      fromAmount: item.fromAmount,
      currency: item.currency,
      fromLabel,
      perPersonLabel,
      viewDetailsLabel,
      highlights: item.highlightKeys.map((key) => t(key)),
      packageTags: toPackageTags(item.packageTags, t),
      nextAvailability: item.nextAvailability,
    })),
  };
}

// ── Why Us ───────────────────────────────────────────────────────────────────

export function toLandingWhyUsContent(
  raw: LandingFeed,
  t: Translator,
): LandingContent['whyUs'] {
  return {
    sectionTitle: t(raw.whyUs.sectionTitleKey),
    lead: t(raw.whyUs.leadKey),
    portrait: raw.whyUs.portrait
      ? {
          image: raw.whyUs.portrait.image,
          alt: t(raw.whyUs.portrait.altKey),
          caption: t(raw.whyUs.portrait.captionKey),
        }
      : undefined,
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
  raw: LandingFeed,
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
  raw: LandingFeed,
  t: Translator,
): LandingContent['travelerSegments'] {
  return {
    sectionTitle: t(raw.travelerSegments.sectionTitleKey),
    segments: raw.travelerSegments.segments.map((seg) => ({
      id: seg.id,
      iconName: seg.iconName,
      label: t(seg.labelKey),
      title: t(seg.titleKey),
      bullets: seg.bulletKeys.map((key) => t(key)),
      image: seg.image,
      imageAlt: t(seg.imageAltKey),
      ctaLabel: t(seg.ctaLabelKey),
      ctaHref: seg.ctaHref,
    })),
  };
}

// ── Trust Stats ──────────────────────────────────────────────────────────────

export function toLandingTrustStatsContent(
  raw: LandingFeed,
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
  raw: LandingFeed,
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
  raw: LandingFeed,
  t: Translator,
): LandingContent['safety'] {
  return {
    sectionTitle: t(raw.safety.sectionTitleKey),
    lead: t(raw.safety.leadKey),
    groups: raw.safety.groups.map((group) => ({
      id: group.id,
      title: t(group.titleKey),
      items: group.items.map((item) => ({
        id: item.id,
        iconName: item.iconName,
        title: t(item.titleKey),
      })),
      cta: group.cta
        ? {
            label: t(group.cta.labelKey),
            href: group.cta.href,
            opensInNewTab: t(group.cta.opensInNewTabKey),
          }
        : undefined,
    })),
    protocolLinkLabel: raw.safety.protocolLinkLabelKey
      ? t(raw.safety.protocolLinkLabelKey)
      : undefined,
    protocolHref: raw.safety.protocolHref,
    protocolComingSoon: raw.safety.protocolComingSoonKey
      ? t(raw.safety.protocolComingSoonKey)
      : undefined,
  };
}

// ── Global CTAs ──────────────────────────────────────────────────────────────

export function toLandingGlobalCtasContent(
  raw: LandingFeed,
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
    mobileBookNowLabel: t('Landing.brand.globalCtas.mobileBookNow'),
  };
}
