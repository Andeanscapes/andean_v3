/**
 * Frontend-owned landing page structure.
 *
 * The v2 feed publishes business data only: which experiences exist, their
 * price/duration/location/availability, review facts, brand metrics and
 * brand-level media. It carries no section copy, no icons, no routes and no
 * section ordering — those are presentation, so they live here in source control.
 *
 * Every string in this file is an **i18n key path**, never copy. Icon names are
 * keys into `src/utils/landingIconMap.tsx`; changing one to a translated string
 * makes the lookup miss and silently drops the icon.
 *
 * Section order is defined by `LandingPage.tsx`, not here.
 */

export const LANDING_STRUCTURE = {
  hero: {
    eyebrowKey: 'Landing.brand.hero.eyebrow',
    titleKey: 'Landing.brand.hero.title',
    subtitleKey: 'Landing.brand.hero.subtitle',
    descriptionKey: 'Landing.brand.hero.description',
    // Remove after the published v2 feed carries `media`.
    backgroundImage: '/assets/images/hero/h0.webp',
    primaryCtaLabelKey: 'Landing.brand.hero.primaryCta',
    primaryCtaHref: '/experiences',
    secondaryCtaLabelKey: 'Landing.brand.hero.secondaryCta',
    trustChips: [
      { id: 'smallGroups', iconName: 'Users', labelKey: 'Landing.brand.hero.chips.smallGroups' },
      { id: 'hostedByLocals', iconName: 'Heart', labelKey: 'Landing.brand.hero.chips.hostedByLocals' },
      { id: 'flexiblePlanning', iconName: 'Calendar', labelKey: 'Landing.brand.hero.chips.flexiblePlanning' },
      { id: 'securePayments', iconName: 'Lock', labelKey: 'Landing.brand.hero.chips.securePayments' },
      { id: 'englishSupport', iconName: 'Languages', labelKey: 'Landing.brand.hero.chips.englishSupport' },
    ],
    bookingCard: {
      reserveLabelKey: 'Landing.brand.hero.bookingCard.reserveLabel',
      askFirstLabelKey: 'Landing.brand.hero.bookingCard.askFirstLabel',
      nextAvailabilityLabelKey: 'Landing.brand.hero.bookingCard.nextAvailability',
    },
  },

  categories: {
    sectionTitleKey: 'Landing.brand.categories.title',
    ctaLabelKey: 'Landing.brand.categories.cta',
    items: [
      {
        id: 'emerald',
        iconName: 'Gem',
        titleKey: 'Landing.brand.categories.items.emerald.title',
        descriptionKey: 'Landing.brand.categories.items.emerald.description',
        exclusiveAccessKey: 'Landing.brand.categories.items.emerald.exclusiveAccess',
        imageUrl: '/assets/images/details/emerald-mining-card.webp',
        href: '/experiences',
      },
      {
        id: 'nature',
        iconName: 'Mountain',
        titleKey: 'Landing.brand.categories.items.nature.title',
        descriptionKey: 'Landing.brand.categories.items.nature.description',
        imageUrl: '/assets/images/hero/h7.webp',
        href: '/experiences',
      },
      {
        id: 'rural',
        iconName: 'Home',
        titleKey: 'Landing.brand.categories.items.rural.title',
        descriptionKey: 'Landing.brand.categories.items.rural.description',
        imageUrl: '/assets/images/hero/h8.webp',
        href: '/experiences',
      },
      {
        id: 'horseback',
        iconName: 'Compass',
        titleKey: 'Landing.brand.categories.items.horseback.title',
        descriptionKey: 'Landing.brand.categories.items.horseback.description',
        imageUrl: '/assets/images/hero/h10.webp',
        href: '/experiences',
      },
    ],
  },

  featured: {
    sectionTitleKey: 'Landing.brand.featured.title',
    viewAllLabelKey: 'Landing.brand.featured.viewAll',
    viewAllHref: '/experiences',
    badgeKey: 'Landing.brand.featured.badges.featured',
  },

  whyUs: {
    sectionTitleKey: 'Landing.brand.whyUs.title',
    leadKey: 'Landing.brand.whyUs.lead',
    portraitAltKey: 'Landing.brand.whyUs.portrait.alt',
    portraitCaptionKey: 'Landing.brand.whyUs.portrait.caption',
    items: [
      { id: 'localHosts', iconName: 'Heart', titleKey: 'Landing.brand.whyUs.items.localHosts.title', descriptionKey: 'Landing.brand.whyUs.items.localHosts.description' },
      { id: 'smallGroups', iconName: 'Users', titleKey: 'Landing.brand.whyUs.items.smallGroups.title', descriptionKey: 'Landing.brand.whyUs.items.smallGroups.description' },
      { id: 'culturalAccess', iconName: 'Compass', titleKey: 'Landing.brand.whyUs.items.culturalAccess.title', descriptionKey: 'Landing.brand.whyUs.items.culturalAccess.description' },
      { id: 'secureBooking', iconName: 'ShieldCheck', titleKey: 'Landing.brand.whyUs.items.secureBooking.title', descriptionKey: 'Landing.brand.whyUs.items.secureBooking.description' },
    ],
  },

  howItWorks: {
    sectionTitleKey: 'Landing.brand.howItWorks.title',
    steps: [
      { id: 'explore', iconName: 'Search', titleKey: 'Landing.brand.howItWorks.steps.explore.title', descriptionKey: 'Landing.brand.howItWorks.steps.explore.description' },
      { id: 'choose', iconName: 'CalendarCheck', titleKey: 'Landing.brand.howItWorks.steps.choose.title', descriptionKey: 'Landing.brand.howItWorks.steps.choose.description' },
      { id: 'pay', iconName: 'CreditCard', titleKey: 'Landing.brand.howItWorks.steps.pay.title', descriptionKey: 'Landing.brand.howItWorks.steps.pay.description' },
      { id: 'travel', iconName: 'Plane', titleKey: 'Landing.brand.howItWorks.steps.travel.title', descriptionKey: 'Landing.brand.howItWorks.steps.travel.description' },
    ],
  },

  travelerSegments: {
    sectionTitleKey: 'Landing.brand.travelerSegments.title',
    ctaLabelKey: 'Landing.brand.travelerSegments.cta',
    ctaHref: '/experiences',
    segments: [
      { id: 'couples', iconName: 'Heart', labelKey: 'Landing.brand.travelerSegments.segments.couples.label', titleKey: 'Landing.brand.travelerSegments.segments.couples.title', bullet1Key: 'Landing.brand.travelerSegments.segments.couples.bullet1', bullet2Key: 'Landing.brand.travelerSegments.segments.couples.bullet2', bullet3Key: 'Landing.brand.travelerSegments.segments.couples.bullet3', imageAltKey: 'Landing.brand.travelerSegments.segments.couples.imageAlt' },
      { id: 'families', iconName: 'Users', labelKey: 'Landing.brand.travelerSegments.segments.families.label', titleKey: 'Landing.brand.travelerSegments.segments.families.title', bullet1Key: 'Landing.brand.travelerSegments.segments.families.bullet1', bullet2Key: 'Landing.brand.travelerSegments.segments.families.bullet2', bullet3Key: 'Landing.brand.travelerSegments.segments.families.bullet3', imageAltKey: 'Landing.brand.travelerSegments.segments.families.imageAlt' },
      { id: 'nomads', iconName: 'Laptop', labelKey: 'Landing.brand.travelerSegments.segments.nomads.label', titleKey: 'Landing.brand.travelerSegments.segments.nomads.title', bullet1Key: 'Landing.brand.travelerSegments.segments.nomads.bullet1', bullet2Key: 'Landing.brand.travelerSegments.segments.nomads.bullet2', bullet3Key: 'Landing.brand.travelerSegments.segments.nomads.bullet3', imageAltKey: 'Landing.brand.travelerSegments.segments.nomads.imageAlt' },
      { id: 'private', iconName: 'Lock', labelKey: 'Landing.brand.travelerSegments.segments.private.label', titleKey: 'Landing.brand.travelerSegments.segments.private.title', bullet1Key: 'Landing.brand.travelerSegments.segments.private.bullet1', bullet2Key: 'Landing.brand.travelerSegments.segments.private.bullet2', bullet3Key: 'Landing.brand.travelerSegments.segments.private.bullet3', imageAltKey: 'Landing.brand.travelerSegments.segments.private.imageAlt' },
      { id: 'adventure', iconName: 'Mountain', labelKey: 'Landing.brand.travelerSegments.segments.adventure.label', titleKey: 'Landing.brand.travelerSegments.segments.adventure.title', bullet1Key: 'Landing.brand.travelerSegments.segments.adventure.bullet1', bullet2Key: 'Landing.brand.travelerSegments.segments.adventure.bullet2', bullet3Key: 'Landing.brand.travelerSegments.segments.adventure.bullet3', imageAltKey: 'Landing.brand.travelerSegments.segments.adventure.imageAlt' },
      { id: 'culture', iconName: 'Palette', labelKey: 'Landing.brand.travelerSegments.segments.culture.label', titleKey: 'Landing.brand.travelerSegments.segments.culture.title', bullet1Key: 'Landing.brand.travelerSegments.segments.culture.bullet1', bullet2Key: 'Landing.brand.travelerSegments.segments.culture.bullet2', bullet3Key: 'Landing.brand.travelerSegments.segments.culture.bullet3', imageAltKey: 'Landing.brand.travelerSegments.segments.culture.imageAlt' },
    ],
  },

  /**
   * Only `label` is static — every `value` comes from the feed
   * (`reviewSummary` and `metrics`). See `toTrustStats` in the adapter.
   *
   * Deliberately only the three stats the feed can source. `Landing.brand
   * .trustStats.local` / `.safe` have copy but no metric behind them, so
   * rendering them would mean inventing a number.
   */
  trustStats: {
    ratingLabelKey: 'Landing.brand.trustStats.rating',
    travelersLabelKey: 'Landing.brand.trustStats.travelers',
    recommendLabelKey: 'Landing.brand.trustStats.recommend',
  },

  location: {
    sectionTitleKey: 'Landing.brand.location.title',
    mapImage: '/landing/map-bogota-chivor.svg',
    mapImageAltKey: 'Landing.brand.location.mapAlt',
    ctaLabelKey: 'Landing.brand.location.cta',
    ctaHref: '/experiences',
    bullets: [
      { id: 'region', iconName: 'MapPin', labelKey: 'Landing.brand.location.bullets.region' },
      { id: 'driving', iconName: 'Car', labelKey: 'Landing.brand.location.bullets.driving' },
      { id: 'transport', iconName: 'Car', labelKey: 'Landing.brand.location.bullets.transport' },
      { id: 'customizable', iconName: 'Sparkles', labelKey: 'Landing.brand.location.bullets.customizable' },
      { id: 'languages', iconName: 'Languages', labelKey: 'Landing.brand.location.bullets.languages' },
      { id: 'plans', iconName: 'Calendar', labelKey: 'Landing.brand.location.bullets.plans' },
    ],
  },

  safety: {
    sectionTitleKey: 'Landing.brand.safety.title',
    leadKey: 'Landing.brand.safety.lead',
    protocolLinkLabelKey: 'Landing.brand.safety.protocolLink',
    protocolHref: '#safety-full',
    protocolComingSoonKey: 'Landing.brand.safety.protocolComingSoon',
    groups: [
      {
        id: 'financial',
        titleKey: 'Landing.brand.safety.groups.financial',
        items: [
          { id: 'deposit', iconName: 'CreditCard', titleKey: 'Landing.brand.safety.items.deposit' },
          { id: 'flexible', iconName: 'Calendar', titleKey: 'Landing.brand.safety.items.flexible' },
          { id: 'payments', iconName: 'Lock', titleKey: 'Landing.brand.safety.items.payments' },
        ],
      },
      {
        id: 'operational',
        titleKey: 'Landing.brand.safety.groups.operational',
        items: [
          { id: 'guides', iconName: 'BadgeCheck', titleKey: 'Landing.brand.safety.items.guides' },
          { id: 'meetingPoints', iconName: 'MapPin', titleKey: 'Landing.brand.safety.items.meetingPoints' },
        ],
      },
      {
        id: 'assistance',
        titleKey: 'Landing.brand.safety.groups.assistance',
        items: [
          { id: 'whatsapp', iconName: 'MessageCircle', titleKey: 'Landing.brand.safety.items.whatsapp' },
        ],
        // href is resolved at adapt time via `whatsappUrl()`.
        whatsappCta: {
          labelKey: 'Landing.brand.globalCtas.whatsapp',
          opensInNewTabKey: 'Landing.reviews.opensInNewTab',
        },
      },
    ],
  },

  globalCtas: {
    exploreHref: '/experiences',
    exploreLabelKey: 'Landing.brand.globalCtas.explore',
    whatsappLabelKey: 'Landing.brand.globalCtas.whatsapp',
    mobileFromLabelKey: 'Landing.brand.globalCtas.mobileFromLabel',
    mobileBookNowLabelKey: 'Landing.brand.globalCtas.mobileBookNow',
  },

  faqs: {
    titleKey: 'Landing.faqs.title',
    descriptionKey: 'Landing.faqs.description',
    enquiryTitleKey: 'Landing.faqs.enquiryTitle',
    enquiryDescriptionKey: 'Landing.faqs.enquiryDescription',
    planImageAltKey: 'Landing.faqs.planImageAlt',
    itemIds: [
      'whatIsAndeanScapes',
      'emeraldMineTour',
      'transportHelp',
      'minerForADay',
      'safety',
      'emeraldRegions',
      'payment',
      'cancellation',
      'families',
      'pets',
      'bestSeason',
      'bring',
      'meals',
      'spanish',
      'privateTours',
      'privateOrShared',
      'afterReserve',
      'questionsFirst',
      'customized',
      'localOrInternational',
    ],
  },

  finalCta: {
    sectionTitleKey: 'Landing.finalCta.title',
    subtitleKey: 'Landing.finalCta.subtitle',
    // Remove after the published v2 feed carries `media`.
    backgroundImage: '/assets/images/hero/h11.webp',
    primaryCtaLabelKey: 'Landing.finalCta.primaryCta',
    primaryCtaHref: '/experiences',
    secondaryCtaLabelKey: 'Landing.finalCta.secondaryCta',
  },

  reviews: {
    sectionTitleKey: 'Landing.reviews.sectionTitle',
    subtitleKey: 'Landing.reviews.subtitle',
    platformsTitleKey: 'Landing.reviews.platforms.title',
    platforms: [
      { id: 'google', labelKey: 'Landing.reviews.platforms.google', ctaKey: 'Landing.reviews.platforms.readReviews' },
      { id: 'airbnb', labelKey: 'Landing.reviews.platforms.airbnb', ctaKey: 'Landing.reviews.platforms.book' },
      { id: 'getyourguide', labelKey: 'Landing.reviews.platforms.getyourguide', ctaKey: 'Landing.reviews.platforms.book' },
    ],
  },
} as const;

export type LandingStructure = typeof LANDING_STRUCTURE;
