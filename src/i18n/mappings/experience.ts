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
  RoomMode,
  RoomType,
  TransportMode,
} from '@/lib/schemas/feed/v2';

interface ExperienceI18nMap {
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
}

export const EXPERIENCE_I18N = {
  emeraldMining: {
    title: 'experiences.emeraldMining.title',
    subtitle: 'experiences.emeraldMining.subtitle',
    description: 'experiences.emeraldMining.description',
    transport: {
      car_no_4x4: {
        label: 'experiences.emeraldMining.transport.carNo4x4',
        description: 'experiences.emeraldMining.transport.carNo4x4Description',
      },
      have_4x4: {
        label: 'experiences.emeraldMining.transport.have4x4',
        description: 'experiences.emeraldMining.transport.have4x4Description',
      },
      bus: {
        label: 'experiences.emeraldMining.transport.bus',
        description: 'experiences.emeraldMining.transport.busDescription',
      },
      roundtrip_transfer: {
        label: 'experiences.emeraldMining.transport.roundtripTransfer',
        description: 'experiences.emeraldMining.transport.roundtripTransferDescription',
      },
    },
    // Must cover every RoomModeSchema value, not just the ones this experience
    // currently sells — the feed may enable a cabin tier without a deploy.
    roomMode: {
      standard_single: 'experiences.emeraldMining.roomMode.standardSingle',
      standard_couple: 'experiences.emeraldMining.roomMode.standardCouple',
      family_single: 'experiences.emeraldMining.roomMode.familySingle',
      family_couple: 'experiences.emeraldMining.roomMode.familyCouple',
      family_3: 'experiences.emeraldMining.roomMode.familyThree',
      cabin_single: 'experiences.emeraldMining.roomMode.cabinSingle',
      cabin_couple: 'experiences.emeraldMining.roomMode.cabinCouple',
      cabin_6: 'experiences.emeraldMining.roomMode.cabinSix',
    },
    difficulty: {
      moderate: 'experiences.emeraldMining.logisticsValues.difficulty',
    },
    logistics: {
      start: 'experiences.emeraldMining.logistics.start',
      duration: 'experiences.emeraldMining.logistics.duration',
      transport: 'experiences.emeraldMining.logistics.transport',
      difficulty: 'experiences.emeraldMining.logistics.difficulty',
      durationValue: 'experiences.emeraldMining.logisticsValues.duration',
      transportValue: 'experiences.emeraldMining.logisticsValues.transport',
    },
    included: {
      guide: 'experiences.emeraldMining.included.guide',
      equipment: 'experiences.emeraldMining.included.equipment',
      meals: 'experiences.emeraldMining.included.meals',
      insurance: 'experiences.emeraldMining.included.insurance',
      mineAccess: 'experiences.emeraldMining.included.mineAccess',
      workshop: 'experiences.emeraldMining.included.workshop',
      smallGroups: 'experiences.emeraldMining.included.smallGroups',
    },
    notIncluded: {
      airportTransfer: 'experiences.emeraldMining.notIncluded.airportTransfer',
      drinks: 'experiences.emeraldMining.notIncluded.drinks',
      souvenirs: 'experiences.emeraldMining.notIncluded.souvenirs',
    },
    addons: {
      apiary_cattle: {
        label: 'experiences.emeraldMining.addons.apiaryCattle.label',
        description: 'experiences.emeraldMining.addons.apiaryCattle.description',
      },
      horseback_riding: {
        label: 'experiences.emeraldMining.addons.horsebackRiding.label',
        description: 'experiences.emeraldMining.addons.horsebackRiding.description',
      },
    },
    host: {
      bio: 'experiences.emeraldMining.host.bio',
      idealFor: [
        'experiences.emeraldMining.host.idealFor1',
        'experiences.emeraldMining.host.idealFor2',
        'experiences.emeraldMining.host.idealFor3',
      ],
      goodToKnow: [
        'experiences.emeraldMining.host.goodToKnow1',
        'experiences.emeraldMining.host.goodToKnow2',
        'experiences.emeraldMining.host.goodToKnow3',
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
    },
    reviews: {
      carlosTulio: 'Landing.reviews.items.carlosTulio.comment',
      anamaria: 'Landing.reviews.items.anamaria.comment',
      odessa: 'Landing.reviews.items.odessa.comment',
      sandraPatricia: 'Landing.reviews.items.sandraPatricia.comment',
      camilo: 'Landing.reviews.items.camilo.comment',
    },
  },
} as const satisfies Record<ExperienceId, ExperienceI18nMap>;

export type ExperienceI18nMaps = typeof EXPERIENCE_I18N;

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
  emeraldMining: 'EmeraldMiningAdventure',
} as const satisfies Record<ExperienceId, string>;
