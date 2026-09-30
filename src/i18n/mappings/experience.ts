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
  title: string;
  subtitle: string;
  description: string;
  transport: Record<TransportMode, { label: string; description: string }>;
  roomMode: Record<RoomMode, string>;
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
  notIncluded: Record<NotIncludedCode, string>;
  addons: Record<AddonCode, { label: string; description: string }>;
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
        // Core visits one mine: its stop 2 is the workshop only. The second
        // mine is a Prime benefit, so Prime keeps the shared heritage copy.
        stop2: {
          title: 'experiences.chivorEmeraldCore.itinerary.stop2Title',
          shortDesc: 'experiences.chivorEmeraldCore.itinerary.stop2ShortDesc',
          description: 'experiences.chivorEmeraldCore.itinerary.stop2Desc',
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

export const EXPERIENCE_I18N = {
  chivorEmeraldCore: CHIVOR_EMERALD_CORE_I18N,
  chivorEmeraldPrime: {
    title: 'experiences.chivorEmeraldPrime.title',
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
            title: 'experiences.chivorEmeraldPrime.itinerary.stop1Title',
            shortDesc: 'experiences.chivorEmeraldPrime.itinerary.stop1ShortDesc',
            description: 'experiences.chivorEmeraldPrime.itinerary.stop1Desc',
          },
          stop2: {
            title: 'experiences.chivorEmeraldPrime.itinerary.stop2Title',
            shortDesc: 'experiences.chivorEmeraldPrime.itinerary.stop2ShortDesc',
            description: 'experiences.chivorEmeraldPrime.itinerary.stop2Desc',
          },
          stop3: {
            title: 'experiences.chivorEmeraldPrime.itinerary.stop3Title',
            shortDesc: 'experiences.chivorEmeraldPrime.itinerary.stop3ShortDesc',
            description: 'experiences.chivorEmeraldPrime.itinerary.stop3Desc',
          },
          stop4: {
            title: 'experiences.chivorEmeraldPrime.itinerary.stop4Title',
            shortDesc: 'experiences.chivorEmeraldPrime.itinerary.stop4ShortDesc',
            description: 'experiences.chivorEmeraldPrime.itinerary.stop4Desc',
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
            title: 'experiences.chivorEmeraldPrime.itinerary.stop8Title',
            shortDesc: 'experiences.chivorEmeraldPrime.itinerary.stop8ShortDesc',
            description: 'experiences.chivorEmeraldPrime.itinerary.stop8Desc',
          },
          stop9: {
            title: 'experiences.chivorEmeraldPrime.itinerary.stop9Title',
            shortDesc: 'experiences.chivorEmeraldPrime.itinerary.stop9ShortDesc',
            description: 'experiences.chivorEmeraldPrime.itinerary.stop9Desc',
          },
          stop10: {
            title: 'experiences.chivorEmeraldPrime.itinerary.stop10Title',
            shortDesc: 'experiences.chivorEmeraldPrime.itinerary.stop10ShortDesc',
            description: 'experiences.chivorEmeraldPrime.itinerary.stop10Desc',
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
  /** Transitional alias — see `ExperienceIdSchema`. Remove after the Chivor feed is live. */
  emeraldMining: CHIVOR_EMERALD_CORE_I18N,
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
  chivorEmeraldPrime: 'ChivorEmeraldPrime',
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
} as const satisfies Record<PackageTagCode, { label: string; variant: 'warning' }>;
