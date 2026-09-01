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
    // Matches the `id` rendered by `Reviews.tsx`; verified by landing.structure.test.ts.
    secondaryCtaHref: '#landing-reviews',
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
      trustDepositKey: 'Landing.brand.hero.bookingCard.trust.deposit',
      trustSecureKey: 'Landing.brand.hero.bookingCard.trust.secure',
      trustSupportKey: 'Landing.brand.hero.bookingCard.trust.support',
      trustVettedKey: 'Landing.brand.hero.bookingCard.trust.vetted',
      nextAvailabilityLabelKey: 'Landing.brand.hero.bookingCard.nextAvailability',
      onlyLabelKey: 'Landing.brand.hero.bookingCard.only',
      spotLabelKey: 'Landing.brand.hero.bookingCard.spot',
      spotsLeftLabelKey: 'Landing.brand.hero.bookingCard.spotsLeft',
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
      { id: 'couples', iconName: 'Heart', labelKey: 'Landing.brand.travelerSegments.segments.couples.label', recommendationKey: 'Landing.brand.travelerSegments.segments.couples.recommendation' },
      { id: 'families', iconName: 'Users', labelKey: 'Landing.brand.travelerSegments.segments.families.label', recommendationKey: 'Landing.brand.travelerSegments.segments.families.recommendation' },
      { id: 'nomads', iconName: 'Laptop', labelKey: 'Landing.brand.travelerSegments.segments.nomads.label', recommendationKey: 'Landing.brand.travelerSegments.segments.nomads.recommendation' },
      { id: 'private', iconName: 'Lock', labelKey: 'Landing.brand.travelerSegments.segments.private.label', recommendationKey: 'Landing.brand.travelerSegments.segments.private.recommendation' },
      { id: 'adventure', iconName: 'Mountain', labelKey: 'Landing.brand.travelerSegments.segments.adventure.label', recommendationKey: 'Landing.brand.travelerSegments.segments.adventure.recommendation' },
      { id: 'culture', iconName: 'Palette', labelKey: 'Landing.brand.travelerSegments.segments.culture.label', recommendationKey: 'Landing.brand.travelerSegments.segments.culture.recommendation' },
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
    items: [
      { id: 'guides', iconName: 'BadgeCheck', titleKey: 'Landing.brand.safety.items.guides' },
      { id: 'meetingPoints', iconName: 'MapPin', titleKey: 'Landing.brand.safety.items.meetingPoints' },
      { id: 'payments', iconName: 'Lock', titleKey: 'Landing.brand.safety.items.payments' },
      { id: 'deposit', iconName: 'CreditCard', titleKey: 'Landing.brand.safety.items.deposit' },
      { id: 'whatsapp', iconName: 'MessageCircle', titleKey: 'Landing.brand.safety.items.whatsapp' },
      { id: 'flexible', iconName: 'Calendar', titleKey: 'Landing.brand.safety.items.flexible' },
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
    sectionTitleKey: 'Landing.faqs.sectionTitle',
    itemIds: [
      'whatIsAndeanScapes',
      'privateOrShared',
      'spanish',
      'afterReserve',
      'questionsFirst',
      'transportHelp',
      'meals',
      'families',
      'bring',
      'payment',
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
    trustBadges: [
      { id: 'deposit', iconName: 'CreditCard', labelKey: 'Landing.finalCta.badges.deposit' },
      { id: 'secure', iconName: 'Lock', labelKey: 'Landing.finalCta.badges.secure' },
      { id: 'cancellation', iconName: 'Calendar', labelKey: 'Landing.finalCta.badges.cancellation' },
      { id: 'verified', iconName: 'BadgeCheck', labelKey: 'Landing.finalCta.badges.verified' },
    ],
  },

  reviews: {
    sectionTitleKey: 'Landing.reviews.sectionTitle',
    subtitleKey: 'Landing.reviews.subtitle',
    trustPanel: {
      titleKey: 'Landing.reviews.trustPanel.title',
      bullets: [
        { id: 'local', iconName: 'Home', textKey: 'Landing.reviews.trustPanel.bullets.local' },
        { id: 'reviews', iconName: 'Star', textKey: 'Landing.reviews.trustPanel.bullets.reviews' },
        { id: 'payment', iconName: 'CreditCard', textKey: 'Landing.reviews.trustPanel.bullets.payment' },
        { id: 'support', iconName: 'MessageCircle', textKey: 'Landing.reviews.trustPanel.bullets.support' },
      ],
    },
  },
} as const;

export type LandingStructure = typeof LANDING_STRUCTURE;
