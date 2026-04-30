import type { LandingDataMock } from '../schemas/landing.schema';

export const LANDING_MOCK: LandingDataMock = {
  flagship: {
    experienceId: 'emeraldMining',
    experienceSlug: 'emerald-mining',
    badgeKey: 'Landing.hero.badge',
    titleKey: 'Landing.hero.title',
    subtitleKey: 'Landing.hero.subtitle',
    descriptionKey: 'Landing.hero.description',
    backgroundImage: '/assets/images/hero/h10.webp',
    mobileBackgroundImage: '/assets/images/hero/h10.webp',
    valueChips: [
      { id: 'vc-1', iconName: 'Users', labelKey: 'Landing.hero.chips.smallGroups' },
      { id: 'vc-2', iconName: 'HardHat', labelKey: 'Landing.hero.chips.localGuides' },
      { id: 'vc-3', iconName: 'UtensilsCrossed', labelKey: 'Landing.hero.chips.mealsIncluded' },
      { id: 'vc-4', iconName: 'ShieldCheck', labelKey: 'Landing.hero.chips.securePayment' },
    ],
    pricing: {
      fromAmount: 470000,
      currency: 'COP',
      depositPercent: 15,
    },
    availableDates: [
      { id: 'apr-11-2026', startDate: '2026-04-11T00:00:00.000Z', spots: 5, isAvailable: true },
      { id: 'apr-18-2026', startDate: '2026-04-18T00:00:00.000Z', spots: 4, isAvailable: true },
      { id: 'apr-25-2026', startDate: '2026-04-25T00:00:00.000Z', spots: 3, isAvailable: true },
      { id: 'may-02-2026', startDate: '2026-05-02T00:00:00.000Z', spots: 6, isAvailable: true },
      { id: 'may-09-2026', startDate: '2026-05-09T00:00:00.000Z', spots: 5, isAvailable: true },
    ],
    transportOptions: [
      { value: 'car_no_4x4', labelKey: 'Landing.filters.transport.carNo4x4' },
      { value: 'have_4x4', labelKey: 'Landing.filters.transport.have4x4' },
      { value: 'bus', labelKey: 'Landing.filters.transport.bus' },
      { value: 'roundtrip_transfer', labelKey: 'Landing.filters.transport.roundtrip' },
    ],
    maxPeople: 10,
    minPeople: 1,
    whatsappLink:
      'https://wa.me/573142730360?text=Hola%2C%20quiero%20reservar%20la%20Aventura%20de%20Miner%C3%ADa%20de%20Esmeraldas',
    reviewsCount: 528,
    reviewsRating: 4.9,
  },

  // ── Brand-level sections (new landing structure) ───────────────────────────

  heroBrand: {
    eyebrowKey: 'Landing.brand.hero.eyebrow',
    titleKey: 'Landing.brand.hero.title',
    subtitleKey: 'Landing.brand.hero.subtitle',
    descriptionKey: 'Landing.brand.hero.description',
    backgroundImage: '/assets/images/hero/h10.webp',
    mobileBackgroundImage: '/assets/images/hero/h10-mobile.webp',
    primaryCtaLabelKey: 'Landing.brand.hero.primaryCta',
    primaryCtaHref: '/experiences',
    secondaryCtaLabelKey: 'Landing.brand.hero.secondaryCta',
    secondaryCtaHref:
      'https://wa.me/573142730360?text=Hola%2C%20quiero%20planear%20mi%20viaje%20con%20Andean%20Scapes',
    trustChips: [
      { id: 'tc-1', iconName: 'Users', labelKey: 'Landing.brand.hero.chips.smallGroups' },
      { id: 'tc-2', iconName: 'MapPin', labelKey: 'Landing.brand.hero.chips.hostedByLocals' },
      { id: 'tc-3', iconName: 'CalendarCheck', labelKey: 'Landing.brand.hero.chips.flexiblePlanning' },
      { id: 'tc-4', iconName: 'ShieldCheck', labelKey: 'Landing.brand.hero.chips.securePayments' },
      { id: 'tc-5', iconName: 'Languages', labelKey: 'Landing.brand.hero.chips.englishSupport' },
    ],
    search: {
      destinationLabelKey: 'Landing.brand.hero.search.destinationLabel',
      experienceTypeLabelKey: 'Landing.brand.hero.search.experienceTypeLabel',
      durationLabelKey: 'Landing.brand.hero.search.durationLabel',
      submitLabelKey: 'Landing.brand.hero.search.submit',
      submitHref: '/experiences',
      destinations: [
        { value: 'chivor-boyaca', labelKey: 'Landing.brand.hero.search.destinations.chivor' },
        { value: 'all', labelKey: 'Landing.brand.hero.search.destinations.all' },
      ],
      experienceTypes: [
        { value: 'all', labelKey: 'Landing.brand.hero.search.experienceTypes.all' },
        { value: 'nature', labelKey: 'Landing.brand.hero.search.experienceTypes.nature' },
        { value: 'culture', labelKey: 'Landing.brand.hero.search.experienceTypes.culture' },
        { value: 'adventure', labelKey: 'Landing.brand.hero.search.experienceTypes.adventure' },
      ],
      durations: [
        { value: 'all', labelKey: 'Landing.brand.hero.search.durations.all' },
        { value: '1d', labelKey: 'Landing.brand.hero.search.durations.oneDay' },
        { value: '2d1n', labelKey: 'Landing.brand.hero.search.durations.twoDayOneNight' },
        { value: '3d2n', labelKey: 'Landing.brand.hero.search.durations.threeDayTwoNight' },
      ],
    },
  },

  categories: {
    sectionTitleKey: 'Landing.brand.categories.title',
    items: [
      {
        id: 'emerald',
        iconName: 'Gem',
        titleKey: 'Landing.brand.categories.items.emerald.title',
        descriptionKey: 'Landing.brand.categories.items.emerald.description',
        imageUrl: '/assets/images/packages/p1-1.webp',
        href: '/experiences?type=culture',
        ctaLabelKey: 'Landing.brand.categories.cta',
        exclusiveAccessKey: 'Landing.brand.categories.items.emerald.exclusiveAccess',
      },
      {
        id: 'nature',
        iconName: 'Mountain',
        titleKey: 'Landing.brand.categories.items.nature.title',
        descriptionKey: 'Landing.brand.categories.items.nature.description',
        imageUrl: '/assets/images/packages/p2-1.webp',
        href: '/experiences?type=nature',
        ctaLabelKey: 'Landing.brand.categories.cta',
      },
      {
        id: 'rural',
        iconName: 'Home',
        titleKey: 'Landing.brand.categories.items.rural.title',
        descriptionKey: 'Landing.brand.categories.items.rural.description',
        imageUrl: '/assets/images/packages/p4-1.webp',
        href: '/experiences?type=rural',
        ctaLabelKey: 'Landing.brand.categories.cta',
      },
      {
        id: 'horseback',
        iconName: 'Compass',
        titleKey: 'Landing.brand.categories.items.horseback.title',
        descriptionKey: 'Landing.brand.categories.items.horseback.description',
        imageUrl: '/assets/images/destination/d1-1.webp',
        href: '/experiences?type=adventure',
        ctaLabelKey: 'Landing.brand.categories.cta',
      },
    ],
  },

  featuredExperiences: {
    sectionTitleKey: 'Landing.brand.featured.title',
    viewAllLabelKey: 'Landing.brand.featured.viewAll',
    viewAllHref: '/experiences',
    items: [
      {
        id: 'emerald-mining-adventure',
        experienceSlug: 'emerald-mining-adventure',
        titleKey: 'Landing.brand.featured.items.emerald.title',
        descriptionKey: 'Landing.brand.featured.items.emerald.description',
        image: '/assets/images/packages/p1-1.webp',
        href: '/experiences/emerald-mining-adventure',
        badgeKey: 'Landing.brand.featured.badges.featured',
        durationKey: 'Landing.brand.featured.items.emerald.duration',
        locationKey: 'Landing.brand.featured.items.emerald.location',
        fromAmount: 470000,
        currency: 'COP',
        nextAvailability: { dateISO: '2026-05-12', spotsLeft: 2 },
      },
      {
        id: 'ancestral-pottery-experience',
        experienceSlug: 'ancestral-pottery-experience',
        titleKey: 'Landing.brand.featured.items.pottery.title',
        descriptionKey: 'Landing.brand.featured.items.pottery.description',
        image: '/assets/images/packages/p4-1.webp',
        href: '/experiences',
        badgeKey: 'Landing.brand.featured.badges.new',
        durationKey: 'Landing.brand.featured.items.pottery.duration',
        locationKey: 'Landing.brand.featured.items.pottery.location',
        fromAmount: 320000,
        currency: 'COP',
        nextAvailability: { dateISO: '2026-05-19', spotsLeft: 5 },
      },
    ],
  },

  whyUs: {
    sectionTitleKey: 'Landing.brand.whyUs.title',
    leadKey: 'Landing.brand.whyUs.lead',
    items: [
      {
        id: 'localHosts',
        iconName: 'Users',
        titleKey: 'Landing.brand.whyUs.items.localHosts.title',
        descriptionKey: 'Landing.brand.whyUs.items.localHosts.description',
      },
      {
        id: 'smallGroups',
        iconName: 'Sparkles',
        titleKey: 'Landing.brand.whyUs.items.smallGroups.title',
        descriptionKey: 'Landing.brand.whyUs.items.smallGroups.description',
      },
      {
        id: 'culturalAccess',
        iconName: 'Globe2',
        titleKey: 'Landing.brand.whyUs.items.culturalAccess.title',
        descriptionKey: 'Landing.brand.whyUs.items.culturalAccess.description',
      },
      {
        id: 'secureBooking',
        iconName: 'ShieldCheck',
        titleKey: 'Landing.brand.whyUs.items.secureBooking.title',
        descriptionKey: 'Landing.brand.whyUs.items.secureBooking.description',
      },
    ],
  },

  howItWorks: {
    sectionTitleKey: 'Landing.brand.howItWorks.title',
    steps: [
      {
        id: 'explore',
        iconName: 'Search',
        titleKey: 'Landing.brand.howItWorks.steps.explore.title',
        descriptionKey: 'Landing.brand.howItWorks.steps.explore.description',
      },
      {
        id: 'choose',
        iconName: 'CalendarCheck',
        titleKey: 'Landing.brand.howItWorks.steps.choose.title',
        descriptionKey: 'Landing.brand.howItWorks.steps.choose.description',
      },
      {
        id: 'pay',
        iconName: 'CreditCard',
        titleKey: 'Landing.brand.howItWorks.steps.pay.title',
        descriptionKey: 'Landing.brand.howItWorks.steps.pay.description',
      },
      {
        id: 'travel',
        iconName: 'Plane',
        titleKey: 'Landing.brand.howItWorks.steps.travel.title',
        descriptionKey: 'Landing.brand.howItWorks.steps.travel.description',
      },
    ],
  },

  travelerSegments: {
    sectionTitleKey: 'Landing.brand.travelerSegments.title',
    segments: [
      {
        id: 'couples',
        iconName: 'Heart',
        labelKey: 'Landing.brand.travelerSegments.segments.couples.label',
        recommendationKey: 'Landing.brand.travelerSegments.segments.couples.recommendation',
        ctaLabelKey: 'Landing.brand.travelerSegments.cta',
        ctaHref: '/experiences?segment=couples',
      },
      {
        id: 'families',
        iconName: 'Users',
        labelKey: 'Landing.brand.travelerSegments.segments.families.label',
        recommendationKey: 'Landing.brand.travelerSegments.segments.families.recommendation',
        ctaLabelKey: 'Landing.brand.travelerSegments.cta',
        ctaHref: '/experiences?segment=families',
      },
      {
        id: 'nomads',
        iconName: 'Laptop',
        labelKey: 'Landing.brand.travelerSegments.segments.nomads.label',
        recommendationKey: 'Landing.brand.travelerSegments.segments.nomads.recommendation',
        ctaLabelKey: 'Landing.brand.travelerSegments.cta',
        ctaHref: '/experiences?segment=nomads',
      },
      {
        id: 'private',
        iconName: 'Lock',
        labelKey: 'Landing.brand.travelerSegments.segments.private.label',
        recommendationKey: 'Landing.brand.travelerSegments.segments.private.recommendation',
        ctaLabelKey: 'Landing.brand.travelerSegments.cta',
        ctaHref: '/experiences?segment=private',
      },
      {
        id: 'adventure',
        iconName: 'Mountain',
        labelKey: 'Landing.brand.travelerSegments.segments.adventure.label',
        recommendationKey: 'Landing.brand.travelerSegments.segments.adventure.recommendation',
        ctaLabelKey: 'Landing.brand.travelerSegments.cta',
        ctaHref: '/experiences?segment=adventure',
      },
      {
        id: 'culture',
        iconName: 'Palette',
        labelKey: 'Landing.brand.travelerSegments.segments.culture.label',
        recommendationKey: 'Landing.brand.travelerSegments.segments.culture.recommendation',
        ctaLabelKey: 'Landing.brand.travelerSegments.cta',
        ctaHref: '/experiences?segment=culture',
      },
    ],
  },

  trustStats: {
    items: [
      { id: 'rating', value: '4.9★', labelKey: 'Landing.brand.trustStats.rating' },
      { id: 'travelers', value: '500+', labelKey: 'Landing.brand.trustStats.travelers' },
      { id: 'recommend', value: '98%', labelKey: 'Landing.brand.trustStats.recommend' },
      { id: 'local', value: '🇨🇴', labelKey: 'Landing.brand.trustStats.local' },
      { id: 'safe', value: '✓', labelKey: 'Landing.brand.trustStats.safe' },
    ],
  },

  locationBrand: {
    sectionTitleKey: 'Landing.brand.location.title',
    mapImage: '/landing/map-bogota-chivor.svg',
    mapImageAltKey: 'Landing.brand.location.mapAlt',
    bullets: [
      { id: 'region', iconName: 'MapPin', labelKey: 'Landing.brand.location.bullets.region' },
      { id: 'driving', iconName: 'Clock', labelKey: 'Landing.brand.location.bullets.driving' },
      { id: 'transport', iconName: 'Car', labelKey: 'Landing.brand.location.bullets.transport' },
      { id: 'customizable', iconName: 'Sparkles', labelKey: 'Landing.brand.location.bullets.customizable' },
      { id: 'languages', iconName: 'Languages', labelKey: 'Landing.brand.location.bullets.languages' },
      { id: 'plans', iconName: 'CalendarCheck', labelKey: 'Landing.brand.location.bullets.plans' },
    ],
    ctaLabelKey: 'Landing.brand.location.cta',
    ctaHref: '/experiences',
  },

  safety: {
    sectionTitleKey: 'Landing.brand.safety.title',
    leadKey: 'Landing.brand.safety.lead',
    items: [
      { id: 'guides', iconName: 'BadgeCheck', titleKey: 'Landing.brand.safety.items.guides' },
      { id: 'meetingPoints', iconName: 'MapPin', titleKey: 'Landing.brand.safety.items.meetingPoints' },
      { id: 'payments', iconName: 'Lock', titleKey: 'Landing.brand.safety.items.payments' },
      { id: 'deposit', iconName: 'ShieldCheck', titleKey: 'Landing.brand.safety.items.deposit' },
      { id: 'whatsapp', iconName: 'MessageCircle', titleKey: 'Landing.brand.safety.items.whatsapp' },
      { id: 'flexible', iconName: 'CalendarCheck', titleKey: 'Landing.brand.safety.items.flexible' },
    ],
    protocolLinkLabelKey: 'Landing.brand.safety.protocolLink',
    protocolHref: '#safety-full',
  },

  globalCtas: {
    exploreHref: '/experiences',
    whatsappHref:
      'https://wa.me/573142730360?text=Hola%2C%20quiero%20planear%20mi%20viaje%20con%20Andean%20Scapes',
    fromAmount: 350000,
    currency: 'COP',
  },

  valueProps: {
    titleKey: 'Landing.valueProps.title',
    items: [
      {
        id: 'vp-1',
        titleKey: 'Landing.valueProps.items.mining.title',
        descriptionKey: 'Landing.valueProps.items.mining.description',
        imageUrl: '/assets/images/hero/h10.webp',
        badgeKey: 'Landing.valueProps.items.mining.badge',
      },
      {
        id: 'vp-2',
        titleKey: 'Landing.valueProps.items.access.title',
        descriptionKey: 'Landing.valueProps.items.access.description',
        imageUrl: '/assets/images/hero/h7.webp',
      },
      {
        id: 'vp-3',
        titleKey: 'Landing.valueProps.items.culture.title',
        descriptionKey: 'Landing.valueProps.items.culture.description',
        imageUrl: '/assets/images/hero/h8.webp',
      },
    ],
  },

  inclusions: {
    sectionTitleKey: 'Landing.inclusions.sectionTitle',
    includedLabelKey: 'Landing.inclusions.includedLabel',
    notIncludedLabelKey: 'Landing.inclusions.notIncludedLabel',
    logistics: [
      { id: 'start', icon: 'Clock', labelKey: 'Landing.inclusions.logistics.start', value: '11:00 AM' },
      { id: 'duration', icon: 'Hourglass', labelKey: 'Landing.inclusions.logistics.duration', value: '2 Days / 1 Night' },
      { id: 'transport', icon: 'Car', labelKey: 'Landing.inclusions.logistics.transport', value: '4x4 Included' },
      { id: 'difficulty', icon: 'Activity', labelKey: 'Landing.inclusions.logistics.difficulty', value: 'Moderate' },
    ],
    included: [
      { id: 'inc-guide', titleKey: 'Landing.inclusions.included.guide' },
      { id: 'inc-equipment', titleKey: 'Landing.inclusions.included.equipment' },
      { id: 'inc-meals', titleKey: 'Landing.inclusions.included.meals' },
      { id: 'inc-insurance', titleKey: 'Landing.inclusions.included.insurance' },
      { id: 'inc-mine', titleKey: 'Landing.inclusions.included.mineAccess' },
      { id: 'inc-workshop', titleKey: 'Landing.inclusions.included.workshop' },
      { id: 'inc-small', titleKey: 'Landing.inclusions.included.smallGroups' },
    ],
    notIncluded: [
      { id: 'ni-airport', titleKey: 'Landing.inclusions.notIncluded.airportTransfer' },
      { id: 'ni-drinks', titleKey: 'Landing.inclusions.notIncluded.personalDrinks' },
      { id: 'ni-souvenirs', titleKey: 'Landing.inclusions.notIncluded.souvenirs' },
    ],
    location: {
      lat: 4.8699,
      lng: -73.2897,
      label: 'Chivor, Boyacá, Colombia',
      zoom: 13,
    },
  },

  tiers: {
    sectionTitleKey: 'Landing.tiers.sectionTitle',
    items: [
      {
        id: 'day-experience',
        labelKey: 'Landing.tiers.items.day.label',
        descriptionKey: 'Landing.tiers.items.day.description',
        tagKey: 'Landing.tiers.items.day.tag',
        images: {
          main: '/assets/images/hero/h7.webp',
          gallery: ['/assets/images/hero/h7.webp', '/assets/images/hero/h8.webp'],
        },
        fromAmount: 470000,
        href: '/experiences/emerald-mining',
        ctaLabelKey: 'Landing.tiers.items.day.cta',
      },
      {
        id: 'one-night',
        labelKey: 'Landing.tiers.items.night.label',
        descriptionKey: 'Landing.tiers.items.night.description',
        tagKey: 'Landing.tiers.items.night.tag',
        isBestSeller: true,
        images: {
          main: '/assets/images/hero/h10.webp',
          gallery: ['/assets/images/hero/h10.webp', '/assets/images/hero/h8.webp'],
        },
        fromAmount: 890000,
        href: '/experiences/emerald-mining',
        ctaLabelKey: 'Landing.tiers.items.night.cta',
      },
      {
        id: 'private-group',
        labelKey: 'Landing.tiers.items.private.label',
        descriptionKey: 'Landing.tiers.items.private.description',
        tagKey: 'Landing.tiers.items.private.tag',
        images: {
          main: '/assets/images/hero/h8.webp',
          gallery: ['/assets/images/hero/h8.webp', '/assets/images/hero/h7.webp'],
        },
        fromAmount: 1890000,
        href: '/experiences/emerald-mining',
        ctaLabelKey: 'Landing.tiers.items.private.cta',
      },
    ],
  },

  reviews: {
    sectionTitleKey: 'Landing.reviews.sectionTitle',
    subtitleKey: 'Landing.reviews.subtitle',
    items: [
      {
        id: 'r-1',
        name: 'Sarah M.',
        country: 'United States',
        countryFlag: '🇺🇸',
        rating: 5,
        commentKey: 'Landing.reviews.items.sarah.comment',
        avatarUrl: '/assets/images/hero/h7.webp',
        isVerified: true,
        verifiedExperienceKey: 'Landing.reviews.items.sarah.verifiedExperience',
      },
      {
        id: 'r-2',
        name: 'Lucas B.',
        country: 'Brazil',
        countryFlag: '🇧🇷',
        rating: 5,
        commentKey: 'Landing.reviews.items.lucas.comment',
        avatarUrl: '/assets/images/hero/h8.webp',
        isVerified: true,
        verifiedExperienceKey: 'Landing.reviews.items.lucas.verifiedExperience',
      },
      {
        id: 'r-3',
        name: 'Emily R.',
        country: 'United Kingdom',
        countryFlag: '🇬🇧',
        rating: 5,
        commentKey: 'Landing.reviews.items.emily.comment',
        avatarUrl: '/assets/images/hero/h10.webp',
        isVerified: true,
        verifiedExperienceKey: 'Landing.reviews.items.emily.verifiedExperience',
      },
    ],
    trustPanel: {
      titleKey: 'Landing.reviews.trustPanel.title',
      bullets: [
        { id: 'tb-1', iconName: 'MapPin', textKey: 'Landing.reviews.trustPanel.bullets.local' },
        { id: 'tb-2', iconName: 'Star', textKey: 'Landing.reviews.trustPanel.bullets.reviews' },
        { id: 'tb-3', iconName: 'ShieldCheck', textKey: 'Landing.reviews.trustPanel.bullets.payment' },
        { id: 'tb-4', iconName: 'Headphones', textKey: 'Landing.reviews.trustPanel.bullets.support' },
      ],
    },
    aggregateRating: {
      ratingValue: 4.9,
      reviewCount: 528,
    },
  },

  faqs: {
    sectionTitleKey: 'Landing.faqs.sectionTitle',
    items: [
      { id: 'faq-1', questionKey: 'Landing.faqs.items.safe.question', answerKey: 'Landing.faqs.items.safe.answer' },
      { id: 'faq-2', questionKey: 'Landing.faqs.items.experience.question', answerKey: 'Landing.faqs.items.experience.answer' },
      { id: 'faq-3', questionKey: 'Landing.faqs.items.bogota.question', answerKey: 'Landing.faqs.items.bogota.answer' },
      { id: 'faq-4', questionKey: 'Landing.faqs.items.bring.question', answerKey: 'Landing.faqs.items.bring.answer' },
      { id: 'faq-5', questionKey: 'Landing.faqs.items.deposit.question', answerKey: 'Landing.faqs.items.deposit.answer' },
    ],
  },

  finalCta: {
    sectionTitleKey: 'Landing.finalCta.title',
    subtitleKey: 'Landing.finalCta.subtitle',
    backgroundImage: '/assets/images/hero/h10.webp',
    primaryCtaLabelKey: 'Landing.finalCta.primaryCta',
    primaryCtaHref: '/experiences/emerald-mining',
    secondaryCtaLabelKey: 'Landing.finalCta.secondaryCta',
    trustBadges: [
      { id: 'badge-1', iconName: 'ShieldCheck', labelKey: 'Landing.finalCta.badges.deposit' },
      { id: 'badge-2', iconName: 'Lock', labelKey: 'Landing.finalCta.badges.secure' },
      { id: 'badge-3', iconName: 'Undo2', labelKey: 'Landing.finalCta.badges.cancellation' },
      { id: 'badge-4', iconName: 'BadgeCheck', labelKey: 'Landing.finalCta.badges.verified' },
    ],
  },
};
