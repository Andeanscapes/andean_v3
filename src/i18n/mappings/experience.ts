/**
 * Production experience domain code → source-controlled i18n key mappings.
 *
 * These are keyed by experienceId + domain code, never constructed from remote values.
 * The mapped keys must exist in en/es/fr locale files; contract tests verify exhaustiveness.
 */

import type {
  AddonCode,
  DifficultyCode,
  ExperienceId,
  IncludedCode,
  NotIncludedCode,
  PackageTagCode,
  RoomMode,
  RoomType,
  TransportMode,
} from '@/lib/schemas/feed/v2';

export interface ExperienceI18nMap {
  /** Full title with the place name: detail hero, booking bar, JSON-LD. */
  title: string;
  /** Card title without the place name; cards show it as the mine badge instead. */
  cardTitle: string;
  subtitle: string;
  description: string;
  transport: Record<TransportMode, { label: string; description: string }>;
  /**
   * Partial: each experience maps only the room modes, exclusions and add-ons it
   * sells. The adapter throws on any code the feed offers without copy.
   */
  roomMode: Partial<Record<RoomMode, string>>;
  difficulty: Record<DifficultyCode, string>;
  logistics: {
    start: string;
    duration: string;
    transport: string;
    difficulty: string;
    durationValue: string;
    transportValue: string;
  };
  included: Record<IncludedCode, string>;
  notIncluded: Partial<Record<NotIncludedCode, string>>;
  addons: Partial<Record<AddonCode, { label: string; description: string }>>;
  host: {
    bio: string;
    idealFor: readonly [string, string, string];
    goodToKnow: readonly [string, string, string];
  };
  /**
   * Keyed by the feed's tier id. Copy lives under `experiences.tiers.<tierId>.*`
   * — the same namespace the v1 feed pointed at, so rendered output is unchanged.
   */
  tiers: Record<
    string,
    {
      tag: string;
      name: string;
      description: string;
      /** Partial: a tier only maps the room types it actually offers. */
      rooms: Partial<Record<RoomType, string>>;
      days: Record<string, string>;
      stops: Record<string, { title: string; shortDesc: string; description: string }>;
    }
  >;
  reviews: Record<string, string>;
  /**
   * Hero value points, in display order. Per experience because tiers differ:
   * a higher tier lists everything the lower one does, then its extras.
   */
  valueStack: readonly string[];
}

const CHIVOR_EMERALD_CORE_I18N = {
  title: 'experiences.chivorEmeraldCore.title',
  cardTitle: 'experiences.chivorEmeraldCore.cardTitle',
  subtitle: 'experiences.chivorEmeraldCore.subtitle',
  description: 'experiences.chivorEmeraldCore.description',
  transport: {
    car_no_4x4: {
      label: 'experiences.chivorEmeraldCore.transport.carNo4x4',
      description: 'experiences.chivorEmeraldCore.transport.carNo4x4Description',
    },
    have_4x4: {
      label: 'experiences.chivorEmeraldCore.transport.have4x4',
      description: 'experiences.chivorEmeraldCore.transport.have4x4Description',
    },
    bus: {
      label: 'experiences.chivorEmeraldCore.transport.bus',
      description: 'experiences.chivorEmeraldCore.transport.busDescription',
    },
    roundtrip_transfer: {
      label: 'experiences.chivorEmeraldCore.transport.roundtripTransfer',
      description: 'experiences.chivorEmeraldCore.transport.roundtripTransferDescription',
    },
  },
  roomMode: {
    standard_single: 'experiences.chivorEmeraldCore.roomMode.standardSingle',
    standard_couple: 'experiences.chivorEmeraldCore.roomMode.standardCouple',
    family_single: 'experiences.chivorEmeraldCore.roomMode.familySingle',
    family_couple: 'experiences.chivorEmeraldCore.roomMode.familyCouple',
    family_3: 'experiences.chivorEmeraldCore.roomMode.familyThree',
    cabin_single: 'experiences.chivorEmeraldCore.roomMode.cabinSingle',
    cabin_couple: 'experiences.chivorEmeraldCore.roomMode.cabinCouple',
    cabin_6: 'experiences.chivorEmeraldCore.roomMode.cabinSix',
  },
  difficulty: {
    moderate: 'experiences.chivorEmeraldCore.logisticsValues.difficulty',
  },
  logistics: {
    start: 'experiences.chivorEmeraldCore.logistics.start',
    duration: 'experiences.chivorEmeraldCore.logistics.duration',
    transport: 'experiences.chivorEmeraldCore.logistics.transport',
    difficulty: 'experiences.chivorEmeraldCore.logistics.difficulty',
    durationValue: 'experiences.chivorEmeraldCore.logisticsValues.duration',
    transportValue: 'experiences.chivorEmeraldCore.logisticsValues.transport',
  },
  included: {
    guide: 'experiences.chivorEmeraldCore.included.guide',
    equipment: 'experiences.chivorEmeraldCore.included.equipment',
    meals: 'experiences.chivorEmeraldCore.included.meals',
    insurance: 'experiences.chivorEmeraldCore.included.insurance',
    mineAccess: 'experiences.chivorEmeraldCore.included.mineAccess',
    workshop: 'experiences.chivorEmeraldCore.included.workshop',
    smallGroups: 'experiences.chivorEmeraldCore.included.smallGroups',
    healthInsurance: 'experiences.chivorEmeraldCore.included.healthInsurance',
  },
  notIncluded: {
    airportTransfer: 'experiences.chivorEmeraldCore.notIncluded.airportTransfer',
    drinks: 'experiences.chivorEmeraldCore.notIncluded.drinks',
    souvenirs: 'experiences.chivorEmeraldCore.notIncluded.souvenirs',
    transportToChivor: 'experiences.chivorEmeraldCore.notIncluded.transportToChivor',
  },
  addons: {
    apiary_cattle: {
      label: 'experiences.chivorEmeraldCore.addons.apiaryCattle.label',
      description: 'experiences.chivorEmeraldCore.addons.apiaryCattle.description',
    },
    horseback_riding: {
      label: 'experiences.chivorEmeraldCore.addons.horsebackRiding.label',
      description: 'experiences.chivorEmeraldCore.addons.horsebackRiding.description',
    },
  },
  host: {
    bio: 'experiences.chivorEmeraldCore.host.bio',
    idealFor: [
      'experiences.chivorEmeraldCore.host.idealFor1',
      'experiences.chivorEmeraldCore.host.idealFor2',
      'experiences.chivorEmeraldCore.host.idealFor3',
    ],
    goodToKnow: [
      'experiences.chivorEmeraldCore.host.goodToKnow1',
      'experiences.chivorEmeraldCore.host.goodToKnow2',
      'experiences.chivorEmeraldCore.host.goodToKnow3',
    ],
  },
  tiers: {
    heritage: {
      tag: 'experiences.ui.experienceDetails.tierBadgeHeritage',
      name: 'experiences.tiers.heritage.name',
      description: 'experiences.tiers.heritage.desc',
      rooms: {
        standard: 'experiences.tiers.heritage.rooms.standard',
        family: 'experiences.tiers.heritage.rooms.family',
      },
      // Core runs its own itinerary: one mine, one night — independent from Prime's copy.
      days: {
        '1': 'experiences.chivorEmeraldCore.itinerary.day1Title',
        '2': 'experiences.chivorEmeraldCore.itinerary.day2Title',
      },
      stops: {
        stop1: {
          title: 'experiences.itineraryStops.welcomeBreakfast.title',
          shortDesc: 'experiences.itineraryStops.welcomeBreakfast.shortDesc',
          description: 'experiences.itineraryStops.welcomeBreakfast.description',
        },
        stop2: {
          title: 'experiences.itineraryStops.historyTalk.title',
          shortDesc: 'experiences.itineraryStops.historyTalk.shortDesc',
          description: 'experiences.itineraryStops.historyTalk.description',
        },
        stop3: {
          title: 'experiences.itineraryStops.minesViewpoint.title',
          shortDesc: 'experiences.itineraryStops.minesViewpoint.shortDesc',
          description: 'experiences.itineraryStops.minesViewpoint.description',
        },
        stop4: {
          title: 'experiences.chivorEmeraldCore.itinerary.stop4Title',
          shortDesc: 'experiences.chivorEmeraldCore.itinerary.stop4ShortDesc',
          description: 'experiences.chivorEmeraldCore.itinerary.stop4Desc',
        },
        stop5: {
          title: 'experiences.itineraryStops.mineVisit.title',
          shortDesc: 'experiences.itineraryStops.mineVisit.shortDesc',
          description: 'experiences.itineraryStops.mineVisit.description',
        },
        stop6: {
          title: 'experiences.itineraryStops.haciendaDinner.title',
          shortDesc: 'experiences.itineraryStops.haciendaDinner.shortDesc',
          description: 'experiences.itineraryStops.haciendaDinner.description',
        },
        stop7: {
          title: 'experiences.chivorEmeraldCore.itinerary.stop7Title',
          shortDesc: 'experiences.chivorEmeraldCore.itinerary.stop7ShortDesc',
          description: 'experiences.chivorEmeraldCore.itinerary.stop7Desc',
        },
        stop8: {
          title: 'experiences.itineraryStops.haciendaBreakfast.title',
          shortDesc: 'experiences.itineraryStops.haciendaBreakfast.shortDesc',
          description: 'experiences.itineraryStops.haciendaBreakfast.description',
        },
        stop9: {
          title: 'experiences.itineraryStops.optionalMarket.title',
          shortDesc: 'experiences.itineraryStops.optionalMarket.shortDesc',
          description: 'experiences.itineraryStops.optionalMarket.description',
        },
      },
    },
  },
  valueStack: [
    'experiences.ui.experienceDetails.valueStackPrivateMineAccess',
    'experiences.ui.experienceDetails.valueStackLocalExpertGuides',
    'experiences.ui.experienceDetails.valueStackAllMealsIncluded',
    'experiences.ui.experienceDetails.valueStackHaciendaStay',
  ],
  reviews: {
    carlosTulio: 'Landing.reviews.items.carlosTulio.comment',
    anamaria: 'Landing.reviews.items.anamaria.comment',
    odessa: 'Landing.reviews.items.odessa.comment',
    sandraPatricia: 'Landing.reviews.items.sandraPatricia.comment',
    camilo: 'Landing.reviews.items.camilo.comment',
  },
} as const satisfies ExperienceI18nMap;

const CHIVOR_EMERALD_BASIC_I18N = {
  title: 'experiences.chivorEmeraldBasic.title',
  cardTitle: 'experiences.chivorEmeraldBasic.cardTitle',
  subtitle: 'experiences.chivorEmeraldBasic.subtitle',
  description: 'experiences.chivorEmeraldBasic.description',
  transport: {
    car_no_4x4: {
      label: 'experiences.chivorEmeraldBasic.transport.carNo4x4',
      description: 'experiences.chivorEmeraldBasic.transport.carNo4x4Description',
    },
    have_4x4: {
      label: 'experiences.chivorEmeraldBasic.transport.have4x4',
      description: 'experiences.chivorEmeraldBasic.transport.have4x4Description',
    },
    bus: {
      label: 'experiences.chivorEmeraldBasic.transport.bus',
      description: 'experiences.chivorEmeraldBasic.transport.busDescription',
    },
    roundtrip_transfer: {
      label: 'experiences.chivorEmeraldBasic.transport.roundtripTransfer',
      description: 'experiences.chivorEmeraldBasic.transport.roundtripTransferDescription',
    },
  },
  roomMode: {
    standard_single: 'experiences.chivorEmeraldBasic.roomMode.standardSingle',
    standard_couple: 'experiences.chivorEmeraldBasic.roomMode.standardCouple',
  },
  difficulty: {
    moderate: 'experiences.chivorEmeraldBasic.logisticsValues.difficulty',
  },
  logistics: {
    start: 'experiences.chivorEmeraldBasic.logistics.start',
    duration: 'experiences.chivorEmeraldBasic.logistics.duration',
    transport: 'experiences.chivorEmeraldBasic.logistics.transport',
    difficulty: 'experiences.chivorEmeraldBasic.logistics.difficulty',
    durationValue: 'experiences.chivorEmeraldBasic.logisticsValues.duration',
    transportValue: 'experiences.chivorEmeraldBasic.logisticsValues.transport',
  },
  included: {
    guide: 'experiences.chivorEmeraldBasic.included.guide',
    equipment: 'experiences.chivorEmeraldBasic.included.equipment',
    meals: 'experiences.chivorEmeraldBasic.included.meals',
    insurance: 'experiences.chivorEmeraldBasic.included.insurance',
    mineAccess: 'experiences.chivorEmeraldBasic.included.mineAccess',
    workshop: 'experiences.chivorEmeraldBasic.included.workshop',
    smallGroups: 'experiences.chivorEmeraldBasic.included.smallGroups',
    healthInsurance: 'experiences.chivorEmeraldBasic.included.healthInsurance',
  },
  notIncluded: {
    airportTransfer: 'experiences.chivorEmeraldBasic.notIncluded.airportTransfer',
    drinks: 'experiences.chivorEmeraldBasic.notIncluded.drinks',
    souvenirs: 'experiences.chivorEmeraldBasic.notIncluded.souvenirs',
    transportToChivor: 'experiences.chivorEmeraldBasic.notIncluded.transportToChivor',
  },
  addons: {},
  host: {
    bio: 'experiences.chivorEmeraldBasic.host.bio',
    idealFor: [
      'experiences.chivorEmeraldBasic.host.idealFor1',
      'experiences.chivorEmeraldBasic.host.idealFor2',
      'experiences.chivorEmeraldBasic.host.idealFor3',
    ],
    goodToKnow: [
      'experiences.chivorEmeraldBasic.host.goodToKnow1',
      'experiences.chivorEmeraldBasic.host.goodToKnow2',
      'experiences.chivorEmeraldBasic.host.goodToKnow3',
    ],
  },
  tiers: {
    dayVisit: {
      tag: 'experiences.chivorEmeraldBasic.tier.tag',
      name: 'experiences.chivorEmeraldBasic.tier.name',
      description: 'experiences.chivorEmeraldBasic.tier.description',
      rooms: {
        standard: 'experiences.chivorEmeraldBasic.tier.roomStandard',
      },
      days: {
        '1': 'experiences.chivorEmeraldBasic.itinerary.day1Title',
      },
      stops: {
        stop1: {
          title: 'experiences.itineraryStops.welcomeBreakfast.title',
          shortDesc: 'experiences.itineraryStops.welcomeBreakfast.shortDesc',
          description: 'experiences.itineraryStops.welcomeBreakfast.description',
        },
        stop2: {
          title: 'experiences.itineraryStops.historyTalk.title',
          shortDesc: 'experiences.itineraryStops.historyTalk.shortDesc',
          description: 'experiences.itineraryStops.historyTalk.description',
        },
        stop3: {
          title: 'experiences.itineraryStops.minesViewpoint.title',
          shortDesc: 'experiences.itineraryStops.minesViewpoint.shortDesc',
          description: 'experiences.itineraryStops.minesViewpoint.description',
        },
        stop4: {
          title: 'experiences.itineraryStops.mineVisit.title',
          shortDesc: 'experiences.itineraryStops.mineVisit.shortDesc',
          description: 'experiences.itineraryStops.mineVisit.description',
        },
        stop5: {
          title: 'experiences.chivorEmeraldBasic.itinerary.stop5Title',
          shortDesc: 'experiences.chivorEmeraldBasic.itinerary.stop5ShortDesc',
          description: 'experiences.chivorEmeraldBasic.itinerary.stop5Desc',
        },
        stop6: {
          title: 'experiences.chivorEmeraldBasic.itinerary.stop6Title',
          shortDesc: 'experiences.chivorEmeraldBasic.itinerary.stop6ShortDesc',
          description: 'experiences.chivorEmeraldBasic.itinerary.stop6Desc',
        },
      },
    },
  },
  valueStack: [
    'experiences.ui.experienceDetails.valueStackPrivateMineAccess',
    'experiences.ui.experienceDetails.valueStackLocalExpertGuides',
    'experiences.ui.experienceDetails.valueStackBreakfastFiambre',
    'experiences.ui.experienceDetails.valueStackSameDayReturn',
  ],
  reviews: {},
} as const satisfies ExperienceI18nMap;

/**
 * Itinerary for the transitional `emeraldMining` id only.
 *
 * The published pre-split feed still carries the old six stops (11:00, 13:00,
 * 16:30 / 08:00, 10:00, 14:00). Mapping those onto Core's new itinerary copy
 * would render "Welcome breakfast 11:00 … fiambre lunch 08:00" on production
 * between the deploy and the feed sync, and for the feed cache's hour after it.
 * Delete together with the alias and `experiences.tiers.heritage.itinerary`.
 */
const LEGACY_EMERALD_MINING_TIERS = {
  heritage: {
    ...CHIVOR_EMERALD_CORE_I18N.tiers.heritage,
    days: {
      '1': 'experiences.tiers.heritage.itinerary.day1Title',
      '2': 'experiences.tiers.heritage.itinerary.day2Title',
    },
    stops: {
      stop1: {
        title: 'experiences.tiers.heritage.itinerary.stop1Title',
        shortDesc: 'experiences.tiers.heritage.itinerary.stop1ShortDesc',
        description: 'experiences.tiers.heritage.itinerary.stop1Desc',
      },
      stop2: {
        title: 'experiences.tiers.heritage.itinerary.stop2Title',
        shortDesc: 'experiences.tiers.heritage.itinerary.stop2ShortDesc',
        description: 'experiences.tiers.heritage.itinerary.stop2Desc',
      },
      stop3: {
        title: 'experiences.tiers.heritage.itinerary.stop3Title',
        shortDesc: 'experiences.tiers.heritage.itinerary.stop3ShortDesc',
        description: 'experiences.tiers.heritage.itinerary.stop3Desc',
      },
      stop4: {
        title: 'experiences.tiers.heritage.itinerary.stop4Title',
        shortDesc: 'experiences.tiers.heritage.itinerary.stop4ShortDesc',
        description: 'experiences.tiers.heritage.itinerary.stop4Desc',
      },
      stop5: {
        title: 'experiences.tiers.heritage.itinerary.stop5Title',
        shortDesc: 'experiences.tiers.heritage.itinerary.stop5ShortDesc',
        description: 'experiences.tiers.heritage.itinerary.stop5Desc',
      },
      stop6: {
        title: 'experiences.tiers.heritage.itinerary.stop6Title',
        shortDesc: 'experiences.tiers.heritage.itinerary.stop6ShortDesc',
        description: 'experiences.tiers.heritage.itinerary.stop6Desc',
      },
    },
  },
} as const satisfies ExperienceI18nMap['tiers'];

export const EXPERIENCE_I18N = {
  chivorEmeraldCore: CHIVOR_EMERALD_CORE_I18N,
  chivorEmeraldBasic: CHIVOR_EMERALD_BASIC_I18N,
  chivorEmeraldPrime: {
    title: 'experiences.chivorEmeraldPrime.title',
    cardTitle: 'experiences.chivorEmeraldPrime.cardTitle',
    subtitle: 'experiences.chivorEmeraldPrime.subtitle',
    description: 'experiences.chivorEmeraldPrime.description',
    transport: {
      car_no_4x4: {
        label: 'experiences.chivorEmeraldPrime.transport.carNo4x4',
        description: 'experiences.chivorEmeraldPrime.transport.carNo4x4Description',
      },
      have_4x4: {
        label: 'experiences.chivorEmeraldPrime.transport.have4x4',
        description: 'experiences.chivorEmeraldPrime.transport.have4x4Description',
      },
      bus: {
        label: 'experiences.chivorEmeraldPrime.transport.bus',
        description: 'experiences.chivorEmeraldPrime.transport.busDescription',
      },
      roundtrip_transfer: {
        label: 'experiences.chivorEmeraldPrime.transport.roundtripTransfer',
        description: 'experiences.chivorEmeraldPrime.transport.roundtripTransferDescription',
      },
    },
    roomMode: {
      standard_single: 'experiences.chivorEmeraldPrime.roomMode.standardSingle',
      standard_couple: 'experiences.chivorEmeraldPrime.roomMode.standardCouple',
      family_single: 'experiences.chivorEmeraldPrime.roomMode.familySingle',
      family_couple: 'experiences.chivorEmeraldPrime.roomMode.familyCouple',
      family_3: 'experiences.chivorEmeraldPrime.roomMode.familyThree',
      cabin_single: 'experiences.chivorEmeraldPrime.roomMode.cabinSingle',
      cabin_couple: 'experiences.chivorEmeraldPrime.roomMode.cabinCouple',
      cabin_6: 'experiences.chivorEmeraldPrime.roomMode.cabinSix',
    },
    difficulty: {
      moderate: 'experiences.chivorEmeraldPrime.logisticsValues.difficulty',
    },
    logistics: {
      start: 'experiences.chivorEmeraldPrime.logistics.start',
      duration: 'experiences.chivorEmeraldPrime.logistics.duration',
      transport: 'experiences.chivorEmeraldPrime.logistics.transport',
      difficulty: 'experiences.chivorEmeraldPrime.logistics.difficulty',
      durationValue: 'experiences.chivorEmeraldPrime.logisticsValues.duration',
      transportValue: 'experiences.chivorEmeraldPrime.logisticsValues.transport',
    },
    included: {
      guide: 'experiences.chivorEmeraldPrime.included.guide',
      equipment: 'experiences.chivorEmeraldPrime.included.equipment',
      meals: 'experiences.chivorEmeraldPrime.included.meals',
      insurance: 'experiences.chivorEmeraldPrime.included.insurance',
      mineAccess: 'experiences.chivorEmeraldPrime.included.mineAccess',
      workshop: 'experiences.chivorEmeraldPrime.included.workshop',
      smallGroups: 'experiences.chivorEmeraldPrime.included.smallGroups',
      healthInsurance: 'experiences.chivorEmeraldPrime.included.healthInsurance',
    },
    notIncluded: {
      airportTransfer: 'experiences.chivorEmeraldPrime.notIncluded.airportTransfer',
      drinks: 'experiences.chivorEmeraldPrime.notIncluded.drinks',
      souvenirs: 'experiences.chivorEmeraldPrime.notIncluded.souvenirs',
      transportToChivor: 'experiences.chivorEmeraldPrime.notIncluded.transportToChivor',
    },
    addons: {
      apiary_cattle: {
        label: 'experiences.chivorEmeraldPrime.addons.apiaryCattle.label',
        description: 'experiences.chivorEmeraldPrime.addons.apiaryCattle.description',
      },
      horseback_riding: {
        label: 'experiences.chivorEmeraldPrime.addons.horsebackRiding.label',
        description: 'experiences.chivorEmeraldPrime.addons.horsebackRiding.description',
      },
    },
    host: {
      bio: 'experiences.chivorEmeraldPrime.host.bio',
      idealFor: [
        'experiences.chivorEmeraldPrime.host.idealFor1',
        'experiences.chivorEmeraldPrime.host.idealFor2',
        'experiences.chivorEmeraldPrime.host.idealFor3',
      ],
      goodToKnow: [
        'experiences.chivorEmeraldPrime.host.goodToKnow1',
        'experiences.chivorEmeraldPrime.host.goodToKnow2',
        'experiences.chivorEmeraldPrime.host.goodToKnow3',
      ],
    },
    tiers: {
      heritage: {
        tag: 'experiences.ui.experienceDetails.tierBadgeHeritage',
        name: 'experiences.tiers.heritage.name',
        description: 'experiences.tiers.heritage.desc',
        rooms: {
          standard: 'experiences.tiers.heritage.rooms.standard',
          family: 'experiences.tiers.heritage.rooms.family',
        },
        // Prime runs its own itinerary: two mines, horseback, one night — not the shared heritage copy.
        days: {
          '1': 'experiences.chivorEmeraldPrime.itinerary.day1Title',
          '2': 'experiences.chivorEmeraldPrime.itinerary.day2Title',
        },
        stops: {
          stop1: {
            title: 'experiences.itineraryStops.welcomeBreakfast.title',
            shortDesc: 'experiences.itineraryStops.welcomeBreakfast.shortDesc',
            description: 'experiences.itineraryStops.welcomeBreakfast.description',
          },
          stop2: {
            title: 'experiences.itineraryStops.historyTalk.title',
            shortDesc: 'experiences.itineraryStops.historyTalk.shortDesc',
            description: 'experiences.itineraryStops.historyTalk.description',
          },
          stop3: {
            title: 'experiences.itineraryStops.minesViewpoint.title',
            shortDesc: 'experiences.itineraryStops.minesViewpoint.shortDesc',
            description: 'experiences.itineraryStops.minesViewpoint.description',
          },
          stop4: {
            title: 'experiences.itineraryStops.mineVisit.title',
            shortDesc: 'experiences.itineraryStops.mineVisit.shortDesc',
            description: 'experiences.itineraryStops.mineVisit.description',
          },
          stop5: {
            title: 'experiences.chivorEmeraldPrime.itinerary.stop5Title',
            shortDesc: 'experiences.chivorEmeraldPrime.itinerary.stop5ShortDesc',
            description: 'experiences.chivorEmeraldPrime.itinerary.stop5Desc',
          },
          stop6: {
            title: 'experiences.chivorEmeraldPrime.itinerary.stop6Title',
            shortDesc: 'experiences.chivorEmeraldPrime.itinerary.stop6ShortDesc',
            description: 'experiences.chivorEmeraldPrime.itinerary.stop6Desc',
          },
          stop7: {
            title: 'experiences.chivorEmeraldPrime.itinerary.stop7Title',
            shortDesc: 'experiences.chivorEmeraldPrime.itinerary.stop7ShortDesc',
            description: 'experiences.chivorEmeraldPrime.itinerary.stop7Desc',
          },
          stop8: {
            title: 'experiences.itineraryStops.haciendaDinner.title',
            shortDesc: 'experiences.itineraryStops.haciendaDinner.shortDesc',
            description: 'experiences.itineraryStops.haciendaDinner.description',
          },
          stop9: {
            title: 'experiences.chivorEmeraldPrime.itinerary.stop9Title',
            shortDesc: 'experiences.chivorEmeraldPrime.itinerary.stop9ShortDesc',
            description: 'experiences.chivorEmeraldPrime.itinerary.stop9Desc',
          },
          stop10: {
            title: 'experiences.itineraryStops.haciendaBreakfast.title',
            shortDesc: 'experiences.itineraryStops.haciendaBreakfast.shortDesc',
            description: 'experiences.itineraryStops.haciendaBreakfast.description',
          },
          stop11: {
            title: 'experiences.itineraryStops.optionalMarket.title',
            shortDesc: 'experiences.itineraryStops.optionalMarket.shortDesc',
            description: 'experiences.itineraryStops.optionalMarket.description',
          },
        },
      },
    },
    valueStack: [
      'experiences.ui.experienceDetails.valueStackPrivateMineAccess',
      'experiences.ui.experienceDetails.valueStackLocalExpertGuides',
      'experiences.ui.experienceDetails.valueStackAllMealsIncluded',
      'experiences.ui.experienceDetails.valueStackHaciendaStay',
      'experiences.ui.experienceDetails.valueStackTwoMines',
      'experiences.ui.experienceDetails.valueStackHorsebackRiding',
    ],
    reviews: {
      carlosTulio: 'Landing.reviews.items.carlosTulio.comment',
      anamaria: 'Landing.reviews.items.anamaria.comment',
      odessa: 'Landing.reviews.items.odessa.comment',
      sandraPatricia: 'Landing.reviews.items.sandraPatricia.comment',
      camilo: 'Landing.reviews.items.camilo.comment',
    },
  },
  coscuezEmeraldCore: {
    title: 'experiences.coscuezEmeraldCore.title',
    cardTitle: 'experiences.coscuezEmeraldCore.cardTitle',
    subtitle: 'experiences.coscuezEmeraldCore.subtitle',
    description: 'experiences.coscuezEmeraldCore.description',
    transport: {
      car_no_4x4: {
        label: 'experiences.coscuezEmeraldCore.transport.carNo4x4',
        description: 'experiences.coscuezEmeraldCore.transport.carNo4x4Description',
      },
      have_4x4: {
        label: 'experiences.coscuezEmeraldCore.transport.have4x4',
        description: 'experiences.coscuezEmeraldCore.transport.have4x4Description',
      },
      bus: {
        label: 'experiences.coscuezEmeraldCore.transport.bus',
        description: 'experiences.coscuezEmeraldCore.transport.busDescription',
      },
      roundtrip_transfer: {
        label: 'experiences.coscuezEmeraldCore.transport.roundtripTransfer',
        description: 'experiences.coscuezEmeraldCore.transport.roundtripTransferDescription',
      },
    },
    roomMode: {
      standard_single: 'experiences.coscuezEmeraldCore.roomMode.standardSingle',
      standard_couple: 'experiences.coscuezEmeraldCore.roomMode.standardCouple',
    },
    difficulty: {
      moderate: 'experiences.coscuezEmeraldCore.logisticsValues.difficulty',
    },
    logistics: {
      start: 'experiences.coscuezEmeraldCore.logistics.start',
      duration: 'experiences.coscuezEmeraldCore.logistics.duration',
      transport: 'experiences.coscuezEmeraldCore.logistics.transport',
      difficulty: 'experiences.coscuezEmeraldCore.logistics.difficulty',
      durationValue: 'experiences.coscuezEmeraldCore.logisticsValues.duration',
      transportValue: 'experiences.coscuezEmeraldCore.logisticsValues.transport',
    },
    included: {
      guide: 'experiences.coscuezEmeraldCore.included.guide',
      equipment: 'experiences.coscuezEmeraldCore.included.equipment',
      meals: 'experiences.coscuezEmeraldCore.included.meals',
      insurance: 'experiences.coscuezEmeraldCore.included.insurance',
      mineAccess: 'experiences.coscuezEmeraldCore.included.mineAccess',
      workshop: 'experiences.coscuezEmeraldCore.included.workshop',
      smallGroups: 'experiences.coscuezEmeraldCore.included.smallGroups',
      healthInsurance: 'experiences.coscuezEmeraldCore.included.healthInsurance',
    },
    notIncluded: {
      airportTransfer: 'experiences.coscuezEmeraldCore.notIncluded.airportTransfer',
      drinks: 'experiences.coscuezEmeraldCore.notIncluded.drinks',
      souvenirs: 'experiences.coscuezEmeraldCore.notIncluded.souvenirs',
      transportToBorbur: 'experiences.coscuezEmeraldCore.notIncluded.transportToBorbur',
    },
    addons: {},
    host: {
      bio: 'experiences.coscuezEmeraldCore.host.bio',
      idealFor: [
        'experiences.coscuezEmeraldCore.host.idealFor1',
        'experiences.coscuezEmeraldCore.host.idealFor2',
        'experiences.coscuezEmeraldCore.host.idealFor3',
      ],
      goodToKnow: [
        'experiences.coscuezEmeraldCore.host.goodToKnow1',
        'experiences.coscuezEmeraldCore.host.goodToKnow2',
        'experiences.coscuezEmeraldCore.host.goodToKnow3',
      ],
    },
    tiers: {
      borbur: {
        tag: 'experiences.ui.experienceDetails.tierBadgeBorbur',
        name: 'experiences.tiers.borbur.name',
        description: 'experiences.tiers.borbur.desc',
        rooms: {
          standard: 'experiences.tiers.borbur.rooms.standard',
        },
        days: {
          '1': 'experiences.coscuezEmeraldCore.itinerary.day1Title',
          '2': 'experiences.coscuezEmeraldCore.itinerary.day2Title',
        },
        stops: {
          stop1: {
            title: 'experiences.itineraryStops.borburBreakfast.title',
            shortDesc: 'experiences.itineraryStops.borburBreakfast.shortDesc',
            description: 'experiences.itineraryStops.borburBreakfast.description',
          },
          stop2: {
            title: 'experiences.itineraryStops.historyTalk.title',
            shortDesc: 'experiences.itineraryStops.historyTalk.shortDesc',
            description: 'experiences.itineraryStops.historyTalk.description',
          },
          stop3: {
            title: 'experiences.itineraryStops.chacaroWorkshop.title',
            shortDesc: 'experiences.itineraryStops.chacaroWorkshop.shortDesc',
            description: 'experiences.itineraryStops.chacaroWorkshop.description',
          },
          stop4: {
            title: 'experiences.itineraryStops.miningLunch.title',
            shortDesc: 'experiences.itineraryStops.miningLunch.shortDesc',
            description: 'experiences.itineraryStops.miningLunch.description',
          },
          stop5: {
            title: 'experiences.itineraryStops.mineVisit.title',
            shortDesc: 'experiences.itineraryStops.mineVisit.shortDesc',
            description: 'experiences.itineraryStops.mineVisit.description',
          },
          stop6: {
            title: 'experiences.coscuezEmeraldCore.itinerary.stop6Title',
            shortDesc: 'experiences.coscuezEmeraldCore.itinerary.stop6ShortDesc',
            description: 'experiences.coscuezEmeraldCore.itinerary.stop6Desc',
          },
          stop7: {
            title: 'experiences.itineraryStops.ruralHotelDinner.title',
            shortDesc: 'experiences.itineraryStops.ruralHotelDinner.shortDesc',
            description: 'experiences.itineraryStops.ruralHotelDinner.description',
          },
          stop8: {
            title: 'experiences.itineraryStops.ruralHotelStay.title',
            shortDesc: 'experiences.itineraryStops.ruralHotelStay.shortDesc',
            description: 'experiences.itineraryStops.ruralHotelStay.description',
          },
          stop9: {
            title: 'experiences.coscuezEmeraldCore.itinerary.stop9Title',
            shortDesc: 'experiences.coscuezEmeraldCore.itinerary.stop9ShortDesc',
            description: 'experiences.coscuezEmeraldCore.itinerary.stop9Desc',
          },
        },
      },
    },
    valueStack: [
      'experiences.ui.experienceDetails.valueStackLocalExpertGuides',
      'experiences.ui.experienceDetails.valueStackAllMealsIncluded',
      'experiences.ui.experienceDetails.valueStackRuralHotelStay',
    ],
    reviews: {},
  },
  coscuezEmeraldPrime: {
    title: 'experiences.coscuezEmeraldPrime.title',
    cardTitle: 'experiences.coscuezEmeraldPrime.cardTitle',
    subtitle: 'experiences.coscuezEmeraldPrime.subtitle',
    description: 'experiences.coscuezEmeraldPrime.description',
    transport: {
      car_no_4x4: {
        label: 'experiences.coscuezEmeraldPrime.transport.carNo4x4',
        description: 'experiences.coscuezEmeraldPrime.transport.carNo4x4Description',
      },
      have_4x4: {
        label: 'experiences.coscuezEmeraldPrime.transport.have4x4',
        description: 'experiences.coscuezEmeraldPrime.transport.have4x4Description',
      },
      bus: {
        label: 'experiences.coscuezEmeraldPrime.transport.bus',
        description: 'experiences.coscuezEmeraldPrime.transport.busDescription',
      },
      roundtrip_transfer: {
        label: 'experiences.coscuezEmeraldPrime.transport.roundtripTransfer',
        description: 'experiences.coscuezEmeraldPrime.transport.roundtripTransferDescription',
      },
    },
    roomMode: {
      standard_single: 'experiences.coscuezEmeraldPrime.roomMode.standardSingle',
      standard_couple: 'experiences.coscuezEmeraldPrime.roomMode.standardCouple',
    },
    difficulty: {
      moderate: 'experiences.coscuezEmeraldPrime.logisticsValues.difficulty',
    },
    logistics: {
      start: 'experiences.coscuezEmeraldPrime.logistics.start',
      duration: 'experiences.coscuezEmeraldPrime.logistics.duration',
      transport: 'experiences.coscuezEmeraldPrime.logistics.transport',
      difficulty: 'experiences.coscuezEmeraldPrime.logistics.difficulty',
      durationValue: 'experiences.coscuezEmeraldPrime.logisticsValues.duration',
      transportValue: 'experiences.coscuezEmeraldPrime.logisticsValues.transport',
    },
    included: {
      guide: 'experiences.coscuezEmeraldPrime.included.guide',
      equipment: 'experiences.coscuezEmeraldPrime.included.equipment',
      meals: 'experiences.coscuezEmeraldPrime.included.meals',
      insurance: 'experiences.coscuezEmeraldPrime.included.insurance',
      mineAccess: 'experiences.coscuezEmeraldPrime.included.mineAccess',
      workshop: 'experiences.coscuezEmeraldPrime.included.workshop',
      smallGroups: 'experiences.coscuezEmeraldPrime.included.smallGroups',
      healthInsurance: 'experiences.coscuezEmeraldPrime.included.healthInsurance',
    },
    notIncluded: {
      airportTransfer: 'experiences.coscuezEmeraldPrime.notIncluded.airportTransfer',
      drinks: 'experiences.coscuezEmeraldPrime.notIncluded.drinks',
      souvenirs: 'experiences.coscuezEmeraldPrime.notIncluded.souvenirs',
      transportToBorbur: 'experiences.coscuezEmeraldPrime.notIncluded.transportToBorbur',
    },
    addons: {},
    host: {
      bio: 'experiences.coscuezEmeraldPrime.host.bio',
      idealFor: [
        'experiences.coscuezEmeraldPrime.host.idealFor1',
        'experiences.coscuezEmeraldPrime.host.idealFor2',
        'experiences.coscuezEmeraldPrime.host.idealFor3',
      ],
      goodToKnow: [
        'experiences.coscuezEmeraldPrime.host.goodToKnow1',
        'experiences.coscuezEmeraldPrime.host.goodToKnow2',
        'experiences.coscuezEmeraldPrime.host.goodToKnow3',
      ],
    },
    tiers: {
      borbur: {
        tag: 'experiences.ui.experienceDetails.tierBadgeBorbur',
        name: 'experiences.tiers.borbur.name',
        description: 'experiences.tiers.borbur.desc',
        rooms: {
          standard: 'experiences.tiers.borbur.rooms.standard',
        },
        days: {
          '1': 'experiences.coscuezEmeraldPrime.itinerary.day1Title',
          '2': 'experiences.coscuezEmeraldPrime.itinerary.day2Title',
        },
        stops: {
          stop1: {
            title: 'experiences.itineraryStops.borburBreakfast.title',
            shortDesc: 'experiences.itineraryStops.borburBreakfast.shortDesc',
            description: 'experiences.itineraryStops.borburBreakfast.description',
          },
          stop2: {
            title: 'experiences.itineraryStops.historyTalk.title',
            shortDesc: 'experiences.itineraryStops.historyTalk.shortDesc',
            description: 'experiences.itineraryStops.historyTalk.description',
          },
          stop3: {
            title: 'experiences.itineraryStops.chacaroWorkshop.title',
            shortDesc: 'experiences.itineraryStops.chacaroWorkshop.shortDesc',
            description: 'experiences.itineraryStops.chacaroWorkshop.description',
          },
          stop4: {
            title: 'experiences.itineraryStops.miningLunch.title',
            shortDesc: 'experiences.itineraryStops.miningLunch.shortDesc',
            description: 'experiences.itineraryStops.miningLunch.description',
          },
          stop5: {
            title: 'experiences.itineraryStops.mineVisit.title',
            shortDesc: 'experiences.itineraryStops.mineVisit.shortDesc',
            description: 'experiences.itineraryStops.mineVisit.description',
          },
          stop6: {
            title: 'experiences.itineraryStops.ruralHotelDinner.title',
            shortDesc: 'experiences.itineraryStops.ruralHotelDinner.shortDesc',
            description: 'experiences.itineraryStops.ruralHotelDinner.description',
          },
          stop7: {
            title: 'experiences.itineraryStops.ruralHotelStay.title',
            shortDesc: 'experiences.itineraryStops.ruralHotelStay.shortDesc',
            description: 'experiences.itineraryStops.ruralHotelStay.description',
          },
          stop8: {
            title: 'experiences.coscuezEmeraldPrime.itinerary.stop8Title',
            shortDesc: 'experiences.coscuezEmeraldPrime.itinerary.stop8ShortDesc',
            description: 'experiences.coscuezEmeraldPrime.itinerary.stop8Desc',
          },
          stop9: {
            title: 'experiences.coscuezEmeraldPrime.itinerary.stop9Title',
            shortDesc: 'experiences.coscuezEmeraldPrime.itinerary.stop9ShortDesc',
            description: 'experiences.coscuezEmeraldPrime.itinerary.stop9Desc',
          },
          stop10: {
            title: 'experiences.coscuezEmeraldPrime.itinerary.stop10Title',
            shortDesc: 'experiences.coscuezEmeraldPrime.itinerary.stop10ShortDesc',
            description: 'experiences.coscuezEmeraldPrime.itinerary.stop10Desc',
          },
          stop11: {
            title: 'experiences.coscuezEmeraldPrime.itinerary.stop11Title',
            shortDesc: 'experiences.coscuezEmeraldPrime.itinerary.stop11ShortDesc',
            description: 'experiences.coscuezEmeraldPrime.itinerary.stop11Desc',
          },
        },
      },
    },
    valueStack: [
      'experiences.ui.experienceDetails.valueStackLocalExpertGuides',
      'experiences.ui.experienceDetails.valueStackAllMealsIncluded',
      'experiences.ui.experienceDetails.valueStackRuralHotelStay',
      'experiences.ui.experienceDetails.valueStackFuraTena',
    ],
    reviews: {},
  },
  /** Transitional alias — see `ExperienceIdSchema`. Remove after the Chivor feed is live. */
  emeraldMining: { ...CHIVOR_EMERALD_CORE_I18N, tiers: LEGACY_EMERALD_MINING_TIERS },
} as const satisfies Record<ExperienceId, ExperienceI18nMap>;

/**
 * Per-experience i18n namespace used for page metadata.
 *
 * Deliberately a sibling of `EXPERIENCE_I18N` rather than a field inside it:
 * these are namespace *roots*, not key paths, so they resolve to objects. The
 * exhaustive sweep in `contract.test.ts` asserts every string in the mapping
 * tables resolves to a string, and a root would fail it.
 *
 * The v1 feed carried this per card; v2 drops it, so the frontend owns it.
 */
export const EXPERIENCE_METADATA_NAMESPACE = {
  chivorEmeraldCore: 'ChivorEmeraldCore',
  chivorEmeraldBasic: 'ChivorEmeraldBasic',
  chivorEmeraldPrime: 'ChivorEmeraldPrime',
  coscuezEmeraldCore: 'CoscuezEmeraldCore',
  coscuezEmeraldPrime: 'CoscuezEmeraldPrime',
  /** Transitional alias — see `ExperienceIdSchema`. */
  emeraldMining: 'ChivorEmeraldCore',
} as const satisfies Record<ExperienceId, string>;

/**
 * Package badges. The feed says which apply; the frontend owns the copy and
 * the colour, so the "all-inclusive" and "not included" signals look the same
 * on every card and hero.
 */
export const PACKAGE_TAG_I18N = {
  allInclusive: { label: 'experiences.ui.packageTags.allInclusive', variant: 'warning' },
  dayTrip: { label: 'experiences.ui.packageTags.dayTrip', variant: 'warning' },
} as const satisfies Record<PackageTagCode, { label: string; variant: 'warning' }>;
