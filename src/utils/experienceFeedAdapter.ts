/**
 * v2 experience feed → the raw shape the translator pipeline consumes.
 *
 * The v2 feed carries stable domain codes and no copy. This adapter resolves
 * every code to its **i18n key** through `src/i18n/mappings/experience.ts`, so
 * the existing translators in `experienceTranslators.ts` keep working unchanged
 * and no component has to move.
 *
 * Two shape differences are absorbed here rather than pushed into the UI:
 *
 *  1. `roomModes` — v2 uses camelCase (`priceMultiplier`, `occupancy`,
 *     `roomTypeId`, `unitsAvailable`, `tierId`); the booking flow persists the
 *     snake_case form in localStorage and URL state. Renaming it would
 *     invalidate in-flight reservations, so the adapter maps back.
 *  2. `media` → `config.images` — v2 groups images under `media` with a
 *     positional `highlights` array; v1 used named value-proposition slots.
 *     `media.video` passes through to `config.video` (optional until the
 *     published payload carries it).
 *
 * Output is only *key-resolved*, never translated: the `t` pass stays in
 * `experienceTranslators.ts`. Anything user-facing that this file emits must be
 * an i18n key, not copy.
 */

import type { ExperienceData } from '@/lib/schemas';
import type { ExperienceFeedV2, ItineraryCategoryCode } from '@/lib/schemas/feed/v2';
import type { ExperienceI18nMaps } from '@/i18n/mappings/experience';

type ExperienceMapping = ExperienceI18nMaps[keyof ExperienceI18nMaps];

/**
 * Resolve a key that the mapping declares as optional.
 *
 * Room-type copy is tier-scoped and intentionally partial — a tier maps only the
 * room types it sells. A room the feed offers but the mapping does not cover is
 * a misconfiguration: fail loudly rather than render the raw domain code.
 */
function requireEntry<T>(
  table: Partial<Record<string, T>>,
  code: string,
  context: string,
): T {
  const key = table[code];

  if (!key) {
    throw new Error(
      `[ExperienceFeedAdapter] No i18n mapping for ${context} "${code}". ` +
        'Add it to src/i18n/mappings/experience.ts before publishing the feed entry.',
    );
  }

  return key;
}

function requireKey(table: Partial<Record<string, string>>, code: string, context: string): string {
  return requireEntry(table, code, context);
}

/**
 * Frontend-owned booking microcopy. The v1 feed shipped these five keys; they
 * are presentation, not business data, so v2 does not carry them.
 */
const MICROCOPY = {
  deposit: 'experiences.common.deposit',
  balance: 'experiences.common.balance',
  security: 'experiences.common.security',
  ctaPrimary: 'experiences.common.ctaPrimary',
  ctaSecondary: 'experiences.common.ctaSecondary',
} as const;

/**
 * Itinerary stop category → Lucide icon name.
 *
 * Deliberately NOT an i18n table: `Itinerary.tsx` and `ItineraryModal.tsx` look
 * these up in a local `ICON_MAP`, so they must stay stable icon identifiers.
 * Translating them would make every lookup miss and silently drop the icon.
 */
const CATEGORY_ICON = {
  mining: 'Gem',
  workshop: 'Search',
  accommodation: 'Hotel',
  dining: 'Coffee',
  education: 'BookOpen',
  farewell: 'Award',
} as const satisfies Record<ItineraryCategoryCode, string>;

function toItineraryDays(
  tier: ExperienceFeedV2['accommodationTiers'][number],
  mapping: ExperienceMapping,
): NonNullable<NonNullable<ExperienceData['accommodationTiers']>[number]['itinerary']> {
  const tierMapping = requireEntry(mapping.tiers, tier.id, `tier`);

  return tier.itinerary.map((day) => {
    const dayKey = requireKey(tierMapping.days, String(day.day), `day ${day.day} in tier "${tier.id}"`);

    return {
      day: day.day,
      label: dayKey,
      stops: day.stops.map((stop) => {
        const stopMapping = requireEntry(tierMapping.stops, stop.id, `stop in tier "${tier.id}"`);

        return {
          time: stop.time,
          title: stopMapping.title,
          shortDescription: stopMapping.shortDesc,
          description: stopMapping.description,
          images: stop.images,
          categoryIcon: CATEGORY_ICON[stop.categoryCode],
        };
      }),
    };
  });
}

/**
 * Trip logistics rows.
 *
 * `start` carries the feed's machine-readable 24-hour time as a literal — every
 * other value is an i18n key. `translateMaybeKey` in the translator treats a
 * dotless string as already-final, which is why the raw `HH:mm` is passed
 * through rather than a locale-formatted time (`11:00 a. m.` contains dots and
 * would be mistaken for a key).
 */
function toLogistics(
  feed: ExperienceFeedV2,
  mapping: ExperienceMapping,
): NonNullable<ExperienceData['config']['logistics']> {
  const { experience } = feed;

  return [
    {
      id: 'start',
      icon: 'schedule',
      label: mapping.logistics.start,
      value: experience.schedule.startTime,
    },
    {
      id: 'duration',
      icon: 'hourglass_top',
      label: mapping.logistics.duration,
      value: mapping.logistics.durationValue,
    },
    {
      id: 'transport',
      icon: 'directions_car',
      label: mapping.logistics.transport,
      value: mapping.logistics.transportValue,
    },
    {
      id: 'difficulty',
      icon: 'trending_up',
      label: mapping.logistics.difficulty,
      value: mapping.difficulty[experience.difficulty],
    },
  ];
}

/**
 * Compose the v1-shaped raw experience payload from the v2 feed.
 *
 * `whatsappLink` is injected by the caller: it needs the localized prefill
 * message, and this function is deliberately `t`-free.
 */
export function adaptExperienceFeedV2(
  feed: ExperienceFeedV2,
  mapping: ExperienceMapping,
  whatsappLink: string,
): ExperienceData {
  const { experience } = feed;
  const highlights = experience.media.highlights;

  return {
    config: {
      id: experience.id,
      title: mapping.title,
      subtitle: mapping.subtitle,
      description: mapping.description,
      experiencePricePerPerson: experience.pricing.basePerPerson,
      currency: experience.pricing.currency,
      numberOfNights: experience.duration.nights,
      depositPercent: experience.pricing.depositPercent,
      maxPeople: experience.capacity.maximum,
      minPeople: experience.capacity.minimum,
      images: {
        heroBackground: experience.media.hero,
        valuePropositionTile1: highlights[0],
        valuePropositionTile2: highlights[1],
        valuePropositionTile3: highlights[2],
      },
      video: experience.media.video,
      reviewsCount: feed.reviews.length,
      microcopy: { ...MICROCOPY },
      logistics: toLogistics(feed, mapping),
      included: experience.included.map((code) => ({
        id: code,
        title: mapping.included[code],
      })),
      notIncluded: experience.notIncluded.map((code) => ({
        id: code,
        title: mapping.notIncluded[code],
      })),
      location: {
        lat: experience.location.coordinates.latitude,
        lng: experience.location.coordinates.longitude,
        label: experience.location.locality,
      },
      host: {
        name: experience.host.displayName,
        avatarUrl: experience.host.avatar,
        bio: mapping.host.bio,
        idealForItems: [...mapping.host.idealFor],
        goodToKnowItems: [...mapping.host.goodToKnow],
      },
    },
    transportOptions: feed.transportOptions.map((code) => ({
      value: code,
      label: mapping.transport[code].label,
      description: mapping.transport[code].description,
    })),
    // camelCase → snake_case: the booking flow persists these field names.
    roomModes: feed.roomModes.map((mode) => ({
      value: mode.value,
      label: mapping.roomMode[mode.value],
      price_multiplier: mode.priceMultiplier,
      fixed_people: mode.occupancy,
      room_type_id: mode.roomTypeId,
      units_available: mode.unitsAvailable,
      tier_id: mode.tierId,
    })),
    accommodationTiers: feed.accommodationTiers.map((tier) => {
      const tierMapping = requireEntry(mapping.tiers, tier.id, `tier`);

      return {
        id: tier.id,
        tierTag: tierMapping.tag,
        tierLabel: tierMapping.name,
        tierDescription: tierMapping.description,
        isHostChoice: tier.isDefault,
        images: {
          main: tier.media.main,
          thumbnail: tier.media.thumbnail,
          gallery: tier.media.gallery,
        },
        quickSpecs: tier.quickSpecs,
        rooms: tier.rooms.map((room) => ({
          id: room.id,
          label: requireKey(tierMapping.rooms, room.roomTypeId, `room type in tier "${tier.id}"`),
          capacity: room.capacity,
          pricePerNight: room.pricePerNight,
        })),
        roundtripTransfer: tier.roundtripTransfer,
        itinerary: toItineraryDays(tier, mapping),
      };
    }),
    addons: feed.addons.map((addon) => ({
      id: addon.id,
      label: mapping.addons[addon.id].label,
      description: mapping.addons[addon.id].description,
      pricePerPerson: addon.pricePerPerson,
      requiresTeamConfirmation: addon.requiresTeamConfirmation,
    })),
    availableDates: feed.availableDates.map((date) => ({
      id: date.id,
      startDate: date.startDate,
      spots: date.spots,
      isAvailable: date.isAvailable,
    })),
    whatsappLink,
  };
}
