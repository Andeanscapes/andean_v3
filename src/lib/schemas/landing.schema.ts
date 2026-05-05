/**
 * Zod schemas for landing page data validation.
 *
 * Two layers:
 *  - LandingDataMockSchema — raw storage shape (i18n keys, not yet translated)
 *  - LandingContentSchema  — translated, UI-ready shape returned by landing.service
 */

import { z } from 'zod';

// ── Shared atoms ─────────────────────────────────────────────────────────────

const AvailableDateSchema = z.object({
  id: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  spots: z.number(),
  isAvailable: z.boolean(),
});

// ── Raw mock schemas (i18n key strings) ──────────────────────────────────────

export const LandingValueChipMockSchema = z.object({
  id: z.string(),
  iconName: z.string(),
  labelKey: z.string(),
});

export const LandingFlagshipMockSchema = z.object({
  experienceId: z.string(),
  experienceSlug: z.string(),
  badgeKey: z.string(),
  titleKey: z.string(),
  subtitleKey: z.string(),
  descriptionKey: z.string(),
  backgroundImage: z.string(),
  valueChips: z.array(LandingValueChipMockSchema),
  pricing: z.object({
    fromAmount: z.number(),
    currency: z.string(),
    depositPercent: z.number(),
  }),
  availableDates: z.array(AvailableDateSchema),
  transportOptions: z.array(z.object({ value: z.string(), labelKey: z.string() })),
  maxPeople: z.number(),
  minPeople: z.number(),
  whatsappLink: z.string(),
  reviewsCount: z.number(),
  reviewsRating: z.number(),
});

export const LandingValuePropMockSchema = z.object({
  id: z.string(),
  titleKey: z.string(),
  descriptionKey: z.string(),
  imageUrl: z.string(),
  badgeKey: z.string().optional(),
});

export const LandingInclusionItemMockSchema = z.object({
  id: z.string(),
  titleKey: z.string(),
});

export const LandingLogisticItemMockSchema = z.object({
  id: z.string(),
  icon: z.string(),
  labelKey: z.string(),
  value: z.string().optional(),
});

export const LandingTierItemMockSchema = z.object({
  id: z.string(),
  labelKey: z.string(),
  descriptionKey: z.string(),
  tagKey: z.string(),
  isBestSeller: z.boolean().optional(),
  images: z.object({ main: z.string(), gallery: z.array(z.string()) }),
  fromAmount: z.number(),
  href: z.string(),
  ctaLabelKey: z.string(),
});

export const LandingReviewMockSchema = z.object({
  id: z.string(),
  name: z.string(),
  country: z.string(),
  countryFlag: z.string(),
  rating: z.number().min(1).max(5),
  commentKey: z.string(),
  avatarUrl: z.string().optional(),
  isVerified: z.boolean().optional(),
  verifiedExperienceKey: z.string().optional(),
});

export const LandingFaqMockSchema = z.object({
  id: z.string(),
  questionKey: z.string(),
  answerKey: z.string(),
});

export const LandingTrustBulletMockSchema = z.object({
  id: z.string(),
  iconName: z.string(),
  textKey: z.string(),
});

// ── Brand-level mock schemas (new landing structure) ─────────────────────────

export const LandingHeroBrandMockSchema = z.object({
  eyebrowKey: z.string(),
  titleKey: z.string(),
  subtitleKey: z.string(),
  descriptionKey: z.string(),
  backgroundImage: z.string(),
  primaryCtaLabelKey: z.string(),
  primaryCtaHref: z.string(),
  secondaryCtaLabelKey: z.string(),
  secondaryCtaHref: z.string(),
  trustChips: z.array(LandingValueChipMockSchema),
  bookingCard: z.object({
    reserveLabelKey: z.string(),
    askFirstLabelKey: z.string(),
    trustDepositKey: z.string(),
    trustSecureKey: z.string(),
    trustSupportKey: z.string(),
    trustVettedKey: z.string(),
    nextAvailabilityLabelKey: z.string(),
    onlyLabelKey: z.string(),
    spotLabelKey: z.string(),
    spotsLeftLabelKey: z.string(),
  }),
  search: z.object({
    destinations: z.array(z.object({ value: z.string(), labelKey: z.string() })),
    experienceTypes: z.array(z.object({ value: z.string(), labelKey: z.string() })),
    durations: z.array(z.object({ value: z.string(), labelKey: z.string() })),
    destinationLabelKey: z.string(),
    experienceTypeLabelKey: z.string(),
    durationLabelKey: z.string(),
    submitLabelKey: z.string(),
    submitHref: z.string(),
  }),
});

export const LandingCategoryMockSchema = z.object({
  id: z.string(),
  iconName: z.string(),
  titleKey: z.string(),
  descriptionKey: z.string(),
  imageUrl: z.string(),
  href: z.string(),
  ctaLabelKey: z.string(),
  exclusiveAccessKey: z.string().optional(),
});

export const LandingFeaturedExperienceRefMockSchema = z.object({
  id: z.string(),
  experienceSlug: z.string(),
  titleKey: z.string(),
  descriptionKey: z.string(),
  image: z.string(),
  href: z.string(),
  badgeKey: z.string().optional(),
  durationKey: z.string(),
  locationKey: z.string(),
  fromAmount: z.number(),
  currency: z.string(),
  nextAvailability: z.object({
    dateISO: z.string(),
    spotsLeft: z.number(),
  }).optional(),
});

export const LandingWhyUsItemMockSchema = z.object({
  id: z.string(),
  iconName: z.string(),
  titleKey: z.string(),
  descriptionKey: z.string(),
});

export const LandingHowItWorksStepMockSchema = z.object({
  id: z.string(),
  iconName: z.string(),
  titleKey: z.string(),
  descriptionKey: z.string(),
});

export const LandingTravelerSegmentMockSchema = z.object({
  id: z.string(),
  iconName: z.string(),
  labelKey: z.string(),
  recommendationKey: z.string(),
  ctaLabelKey: z.string(),
  ctaHref: z.string(),
});

export const LandingTrustStatMockSchema = z.object({
  id: z.string(),
  value: z.string(),
  labelKey: z.string(),
});

export const LandingLocationBulletMockSchema = z.object({
  id: z.string(),
  iconName: z.string(),
  labelKey: z.string(),
});

export const LandingLocationBrandMockSchema = z.object({
  sectionTitleKey: z.string(),
  mapImage: z.string(),
  mapImageAltKey: z.string(),
  bullets: z.array(LandingLocationBulletMockSchema),
  ctaLabelKey: z.string(),
  ctaHref: z.string(),
});

export const LandingSafetyItemMockSchema = z.object({
  id: z.string(),
  iconName: z.string(),
  titleKey: z.string(),
});

export const LandingSafetyMockSchema = z.object({
  sectionTitleKey: z.string(),
  leadKey: z.string(),
  items: z.array(LandingSafetyItemMockSchema),
  protocolLinkLabelKey: z.string().optional(),
  protocolHref: z.string().optional(),
});

export const LandingGlobalCtasMockSchema = z.object({
  exploreHref: z.string(),
  whatsappHref: z.string(),
  fromAmount: z.number(),
  currency: z.string(),
});

export const LandingDataMockSchema = z.object({
  flagship: LandingFlagshipMockSchema,
  // Brand-level sections (new structure)
  heroBrand: LandingHeroBrandMockSchema,
  categories: z.object({
    sectionTitleKey: z.string(),
    items: z.array(LandingCategoryMockSchema),
  }),
  featuredExperiences: z.object({
    sectionTitleKey: z.string(),
    viewAllLabelKey: z.string(),
    viewAllHref: z.string(),
    items: z.array(LandingFeaturedExperienceRefMockSchema),
  }),
  whyUs: z.object({
    sectionTitleKey: z.string(),
    leadKey: z.string(),
    items: z.array(LandingWhyUsItemMockSchema),
  }),
  howItWorks: z.object({
    sectionTitleKey: z.string(),
    steps: z.array(LandingHowItWorksStepMockSchema),
  }),
  travelerSegments: z.object({
    sectionTitleKey: z.string(),
    segments: z.array(LandingTravelerSegmentMockSchema),
  }),
  trustStats: z.object({
    items: z.array(LandingTrustStatMockSchema),
  }),
  locationBrand: LandingLocationBrandMockSchema,
  safety: LandingSafetyMockSchema,
  globalCtas: LandingGlobalCtasMockSchema,
  // Legacy single-experience sections (kept for retro-compat with old components)
  valueProps: z.object({
    titleKey: z.string(),
    items: z.array(LandingValuePropMockSchema),
  }),
  inclusions: z.object({
    sectionTitleKey: z.string(),
    includedLabelKey: z.string(),
    notIncludedLabelKey: z.string(),
    logistics: z.array(LandingLogisticItemMockSchema),
    included: z.array(LandingInclusionItemMockSchema),
    notIncluded: z.array(LandingInclusionItemMockSchema),
    location: z.object({
      lat: z.number(),
      lng: z.number(),
      label: z.string().optional(),
      zoom: z.number().optional(),
    }).optional(),
  }),
  tiers: z.object({
    sectionTitleKey: z.string(),
    items: z.array(LandingTierItemMockSchema),
  }),
  reviews: z.object({
    sectionTitleKey: z.string(),
    subtitleKey: z.string(),
    items: z.array(LandingReviewMockSchema),
    trustPanel: z.object({
      titleKey: z.string(),
      bullets: z.array(LandingTrustBulletMockSchema),
    }),
    aggregateRating: z.object({
      ratingValue: z.number(),
      reviewCount: z.number(),
    }),
  }),
  faqs: z.object({
    sectionTitleKey: z.string(),
    items: z.array(LandingFaqMockSchema),
  }),
  finalCta: z.object({
    sectionTitleKey: z.string(),
    subtitleKey: z.string(),
    backgroundImage: z.string(),
    primaryCtaLabelKey: z.string(),
    primaryCtaHref: z.string(),
    secondaryCtaLabelKey: z.string(),
    trustBadges: z.array(z.object({
      id: z.string(),
      iconName: z.string(),
      labelKey: z.string(),
    })),
  }),
});

// ── Translated / UI-ready schemas ─────────────────────────────────────────────

export const LandingValueChipSchema = z.object({
  id: z.string(),
  iconName: z.string(),
  label: z.string(),
});

export const LandingFlagshipContentSchema = z.object({
  experienceId: z.string(),
  experienceSlug: z.string(),
  badge: z.string(),
  title: z.string(),
  subtitle: z.string(),
  description: z.string(),
  backgroundImage: z.string(),
  valueChips: z.array(LandingValueChipSchema),
  pricing: z.object({
    fromAmount: z.number(),
    currency: z.string(),
    depositPercent: z.number(),
  }),
  availableDates: z.array(AvailableDateSchema),
  transportOptions: z.array(z.object({ value: z.string(), label: z.string() })),
  maxPeople: z.number(),
  minPeople: z.number(),
  whatsappLink: z.string(),
  reviewsCount: z.number(),
  reviewsRating: z.number(),
  labels: z.object({
    fromLabel: z.string(),
    perPersonLabel: z.string(),
    reviewsCountLabel: z.string(),
    selectDateLabel: z.string(),
    peopleLabel: z.string(),
    arrivalLabel: z.string(),
    ctaLabel: z.string(),
    depositNoteLabel: z.string(),
    trustSecureLabel: z.string(),
    trustCancellationLabel: z.string(),
    trustVerifiedLabel: z.string(),
    whatsappCtaLabel: z.string(),
    fallbackDateLabel: z.string(),
  }),
});

export const LandingValuePropContentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  badge: z.string().optional(),
});

export const LandingInclusionItemContentSchema = z.object({
  id: z.string(),
  title: z.string(),
});

export const LandingReviewContentSchema = z.object({
  id: z.string(),
  name: z.string(),
  country: z.string(),
  countryFlag: z.string(),
  rating: z.number(),
  comment: z.string(),
  avatarUrl: z.string().optional(),
  isVerified: z.boolean().optional(),
  verifiedExperience: z.string().optional(),
});

export const LandingFaqContentSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
});

export const LandingContentSchema = z.object({
  flagship: LandingFlagshipContentSchema,
  // Brand-level translated sections
  heroBrand: z.object({
    eyebrow: z.string(),
    title: z.string(),
    subtitle: z.string(),
    description: z.string(),
    backgroundImage: z.string(),
    primaryCtaLabel: z.string(),
    primaryCtaHref: z.string(),
    secondaryCtaLabel: z.string(),
    secondaryCtaHref: z.string(),
    trustChips: z.array(LandingValueChipSchema),
    bookingCard: z.object({
      reserveLabel: z.string(),
      askFirstLabel: z.string(),
      trustDeposit: z.string(),
      trustSecure: z.string(),
      trustSupport: z.string(),
      trustVetted: z.string(),
      nextAvailabilityLabel: z.string(),
      onlyLabel: z.string(),
      spotLabel: z.string(),
      spotsLeftLabel: z.string(),
    }),
    search: z.object({
      destinations: z.array(z.object({ value: z.string(), label: z.string() })),
      experienceTypes: z.array(z.object({ value: z.string(), label: z.string() })),
      durations: z.array(z.object({ value: z.string(), label: z.string() })),
      destinationLabel: z.string(),
      experienceTypeLabel: z.string(),
      durationLabel: z.string(),
      submitLabel: z.string(),
      submitHref: z.string(),
    }).optional(),
  }),
  categories: z.object({
    sectionTitle: z.string(),
    items: z.array(z.object({
      id: z.string(),
      iconName: z.string(),
      title: z.string(),
      description: z.string(),
      imageUrl: z.string(),
      href: z.string(),
      ctaLabel: z.string(),
      exclusiveAccess: z.string().optional(),
    })),
  }),
  featuredExperiences: z.object({
    sectionTitle: z.string(),
    viewAllLabel: z.string(),
    viewAllHref: z.string(),
    items: z.array(z.object({
      id: z.string(),
      experienceSlug: z.string(),
      title: z.string(),
      description: z.string(),
      image: z.string(),
      href: z.string(),
      badge: z.string().optional(),
      duration: z.string(),
      location: z.string(),
      fromAmount: z.number(),
      currency: z.string(),
      fromLabel: z.string(),
      viewDetailsLabel: z.string(),
      nextAvailability: z.object({
        dateISO: z.string(),
        spotsLeft: z.number(),
      }).optional(),
    })),
  }),
  whyUs: z.object({
    sectionTitle: z.string(),
    lead: z.string(),
    items: z.array(z.object({
      id: z.string(),
      iconName: z.string(),
      title: z.string(),
      description: z.string(),
    })),
  }),
  howItWorks: z.object({
    sectionTitle: z.string(),
    steps: z.array(z.object({
      id: z.string(),
      iconName: z.string(),
      title: z.string(),
      description: z.string(),
    })),
  }),
  travelerSegments: z.object({
    sectionTitle: z.string(),
    segments: z.array(z.object({
      id: z.string(),
      iconName: z.string(),
      label: z.string(),
      recommendation: z.string(),
      ctaLabel: z.string(),
      ctaHref: z.string(),
    })),
  }),
  trustStats: z.object({
    srTitle: z.string(),
    items: z.array(z.object({
      id: z.string(),
      value: z.string(),
      label: z.string(),
    })),
  }),
  locationBrand: z.object({
    sectionTitle: z.string(),
    mapImage: z.string(),
    mapImageAlt: z.string(),
    bullets: z.array(z.object({
      id: z.string(),
      iconName: z.string(),
      label: z.string(),
    })),
    ctaLabel: z.string(),
    ctaHref: z.string(),
  }),
  safety: z.object({
    sectionTitle: z.string(),
    lead: z.string(),
    items: z.array(z.object({
      id: z.string(),
      iconName: z.string(),
      title: z.string(),
    })),
    protocolLinkLabel: z.string().optional(),
    protocolHref: z.string().optional(),
  }),
  globalCtas: z.object({
    exploreHref: z.string(),
    whatsappHref: z.string(),
    fromAmount: z.number(),
    currency: z.string(),
    exploreLabel: z.string(),
    whatsappLabel: z.string(),
    mobileFromLabel: z.string(),
    mobileBookNowLabel: z.string(),
  }),
  // Legacy translated sections (still used by retained components)
  valueProps: z.object({
    title: z.string(),
    items: z.array(LandingValuePropContentSchema),
  }),
  inclusions: z.object({
    sectionTitle: z.string(),
    includedLabel: z.string(),
    notIncludedLabel: z.string(),
    logistics: z.array(z.object({
      id: z.string(),
      icon: z.string(),
      label: z.string(),
      value: z.string().optional(),
    })),
    included: z.array(LandingInclusionItemContentSchema),
    notIncluded: z.array(LandingInclusionItemContentSchema),
    location: z.object({
      lat: z.number(),
      lng: z.number(),
      label: z.string().optional(),
      zoom: z.number().optional(),
    }).optional(),
  }),
  tiers: z.object({
    sectionTitle: z.string(),
    items: z.array(z.object({
      id: z.string(),
      label: z.string(),
      description: z.string(),
      tag: z.string(),
      isBestSeller: z.boolean().optional(),
      images: z.object({ main: z.string(), gallery: z.array(z.string()) }),
      fromAmount: z.number(),
      href: z.string(),
      ctaLabel: z.string(),
    })),
  }),
  reviews: z.object({
    sectionTitle: z.string(),
    subtitle: z.string(),
    eyebrow: z.string(),
    outOf5Aria: z.string(),
    countSuffix: z.string(),
    items: z.array(LandingReviewContentSchema),
    trustPanel: z.object({
      title: z.string(),
      bullets: z.array(z.object({
        id: z.string(),
        iconName: z.string(),
        text: z.string(),
      })),
    }),
    aggregateRating: z.object({
      ratingValue: z.number(),
      reviewCount: z.number(),
    }),
  }),
  faqs: z.object({
    sectionTitle: z.string(),
    items: z.array(LandingFaqContentSchema),
  }),
  finalCta: z.object({
    sectionTitle: z.string(),
    subtitle: z.string(),
    backgroundImage: z.string(),
    bookAria: z.string(),
    primaryCtaLabel: z.string(),
    primaryCtaHref: z.string(),
    secondaryCtaLabel: z.string(),
    trustBadges: z.array(z.object({
      id: z.string(),
      iconName: z.string(),
      label: z.string(),
    })),
  }),
});

// ── Inferred TypeScript types ─────────────────────────────────────────────────

export type LandingDataMock = z.infer<typeof LandingDataMockSchema>;
export type LandingContent = z.infer<typeof LandingContentSchema>;
export type LandingFlagshipContent = z.infer<typeof LandingFlagshipContentSchema>;
export type LandingValuePropContent = z.infer<typeof LandingValuePropContentSchema>;
export type LandingReviewContent = z.infer<typeof LandingReviewContentSchema>;
export type LandingFaqContent = z.infer<typeof LandingFaqContentSchema>;

// Brand-level types (new structure)
export type LandingHeroBrandContent = LandingContent['heroBrand'];
export type LandingCategoriesContent = LandingContent['categories'];
export type LandingCategoryContent = LandingCategoriesContent['items'][number];
export type LandingFeaturedExperiencesContent = LandingContent['featuredExperiences'];
export type LandingFeaturedExperienceContent = LandingFeaturedExperiencesContent['items'][number];
export type LandingWhyUsContent = LandingContent['whyUs'];
export type LandingHowItWorksContent = LandingContent['howItWorks'];
export type LandingTravelerSegmentsContent = LandingContent['travelerSegments'];
export type LandingTravelerSegmentContent = LandingTravelerSegmentsContent['segments'][number];
export type LandingTrustStatsContent = LandingContent['trustStats'];
export type LandingLocationBrandContent = LandingContent['locationBrand'];
export type LandingSafetyContent = LandingContent['safety'];
export type LandingGlobalCtasContent = LandingContent['globalCtas'];
