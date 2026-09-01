import { z } from 'zod';
import {
  AddonCodeSchema,
  AvailableDateSchema,
  CurrencyCodeSchema,
  DifficultyCodeSchema,
  DurationSchema,
  ExperienceIdSchema,
  FullLocationSchema,
  HostIdSchema,
  IncludedCodeSchema,
  ItineraryCategoryCodeSchema,
  MediaPathSchema,
  NotIncludedCodeSchema,
  PublicationStatusSchema,
  SlugSchema,
  ReviewSchema,
  RoomModeSchema,
  RoomTypeSchema,
  Time24hSchema,
  TransportModeSchema,
  uniqueBy,
} from './common.schema';

/**
 * The authoritative booking contract. Unlike the list and landing projections,
 * this resource owns every mutable business value: pricing, capacity, inventory,
 * availability, itinerary and reviews.
 *
 * Identifier VALUES here are frozen — they key localStorage and URL state via
 * `src/utils/reservationStorage.ts` and `src/utils/helpers.ts`. Renaming one
 * invalidates in-flight reservations.
 */

const CoordinatesSchema = z
  .object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  })
  .strict();

const ExperienceCoreSchema = z
  .object({
    id: ExperienceIdSchema,
    slug: SlugSchema,
    status: PublicationStatusSchema,
    difficulty: DifficultyCodeSchema,
    schedule: z
      .object({
        startTime: Time24hSchema,
        /** IANA zone; the feed never ships a formatted local time. */
        timeZone: z.string().min(1),
      })
      .strict(),
    duration: DurationSchema,
    capacity: z
      .object({
        minimum: z.number().int().positive(),
        maximum: z.number().int().positive(),
      })
      .strict()
      .refine((capacity) => capacity.minimum <= capacity.maximum, {
        message: 'capacity.minimum must not exceed capacity.maximum',
      }),
    pricing: z
      .object({
        currency: CurrencyCodeSchema,
        basePerPerson: z.number().int().nonnegative(),
        depositPercent: z.number().int().min(0).max(100),
      })
      .strict(),
    location: FullLocationSchema.extend({
      id: z.string().min(1),
      coordinates: CoordinatesSchema,
    }).strict(),
    media: z
      .object({
        hero: MediaPathSchema,
        card: MediaPathSchema,
        /**
         * Exactly three. `experienceFeedAdapter` maps these positionally onto
         * the three value-proposition tiles, and the translator defaults a
         * missing tile to a hardcoded stock image — so a short array would not
         * fail, it would silently publish unrelated photography. Pinning the
         * length here is what turns that into a schema error the service throws
         * on. A longer array is rejected too: the extra entries would never
         * render, which is a feed authoring mistake worth surfacing.
         */
        highlights: z.array(MediaPathSchema).length(3),
      })
      .strict(),
    host: z
      .object({
        id: HostIdSchema,
        displayName: z.string().min(1),
        avatar: MediaPathSchema,
      })
      .strict(),
    included: z.array(IncludedCodeSchema).nonempty(),
    notIncluded: z.array(NotIncludedCodeSchema),
  })
  .strict();

const RoomModeEntrySchema = z
  .object({
    value: RoomModeSchema,
    tierId: z.string().min(1),
    roomTypeId: RoomTypeSchema,
    occupancy: z.number().int().positive(),
    priceMultiplier: z.number().positive().finite(),
    unitsAvailable: z.number().int().nonnegative(),
  })
  .strict();

const ItineraryStopSchema = z
  .object({
    id: z.string().min(1),
    time: Time24hSchema,
    categoryCode: ItineraryCategoryCodeSchema,
    images: z.array(MediaPathSchema),
  })
  .strict();

const AccommodationTierSchema = z
  .object({
    id: z.string().min(1),
    isDefault: z.boolean(),
    media: z
      .object({
        main: MediaPathSchema,
        thumbnail: MediaPathSchema,
        gallery: z.array(MediaPathSchema),
      })
      .strict(),
    quickSpecs: z
      .object({
        hasPrivateBathroom: z.boolean(),
        hasWifi: z.boolean(),
      })
      .strict(),
    rooms: z
      .array(
        z
          .object({
            id: z.string().min(1),
            roomTypeId: RoomTypeSchema,
            capacity: z.number().int().positive(),
            pricePerNight: z.number().int().nonnegative(),
          })
          .strict(),
      )
      .nonempty(),
    services: z.array(
      z
        .object({
          id: z.string().min(1),
          pricePerPersonPerNight: z.number().int().nonnegative(),
        })
        .strict(),
    ),
    roundtripTransfer: z
      .object({
        origin: z.string().min(1),
        destination: z.string().min(1),
        pricePerVehicle: z.number().int().nonnegative(),
        maxPeoplePerVehicle: z.number().int().positive(),
      })
      .strict(),
    itinerary: z
      .array(
        z
          .object({
            day: z.number().int().positive(),
            stops: z.array(ItineraryStopSchema).nonempty(),
          })
          .strict(),
      )
      .nonempty(),
  })
  .strict();

export const ExperienceFeedV2Schema = z
  .object({
    schemaVersion: z.literal(2),
    experience: ExperienceCoreSchema,
    transportOptions: z.array(TransportModeSchema).nonempty(),
    roomModes: z.array(RoomModeEntrySchema).nonempty(),
    accommodationTiers: z.array(AccommodationTierSchema).nonempty(),
    addons: z.array(
      z
        .object({
          id: AddonCodeSchema,
          pricePerPerson: z.number().int().nonnegative(),
          requiresTeamConfirmation: z.boolean(),
        })
        .strict(),
    ),
    availableDates: z.array(AvailableDateSchema),
    reviews: z.array(ReviewSchema),
  })
  .strict()
  .superRefine((feed, ctx) => {
    const defaults = feed.accommodationTiers.filter((tier) => tier.isDefault);
    if (defaults.length !== 1) {
      ctx.addIssue({
        code: 'custom',
        message: `Exactly one accommodation tier must be default, found ${defaults.length}`,
        path: ['accommodationTiers'],
      });
    }

    const tiersById = new Map(feed.accommodationTiers.map((tier) => [tier.id, tier]));

    feed.roomModes.forEach((mode, index) => {
      const tier = tiersById.get(mode.tierId);
      if (!tier) {
        ctx.addIssue({
          code: 'custom',
          message: `roomModes references unknown tierId "${mode.tierId}"`,
          path: ['roomModes', index, 'tierId'],
        });
        return;
      }
      if (!tier.rooms.some((room) => room.roomTypeId === mode.roomTypeId)) {
        ctx.addIssue({
          code: 'custom',
          message: `tier "${tier.id}" has no room of type "${mode.roomTypeId}"`,
          path: ['roomModes', index, 'roomTypeId'],
        });
      }
    });

    if (!uniqueBy(feed.roomModes, (mode) => mode.value)) {
      ctx.addIssue({ code: 'custom', message: 'Duplicate room mode value', path: ['roomModes'] });
    }
    if (!uniqueBy(feed.accommodationTiers, (tier) => tier.id)) {
      ctx.addIssue({ code: 'custom', message: 'Duplicate tier id', path: ['accommodationTiers'] });
    }
    if (!uniqueBy(feed.addons, (addon) => addon.id)) {
      ctx.addIssue({ code: 'custom', message: 'Duplicate addon id', path: ['addons'] });
    }
    if (!uniqueBy(feed.availableDates, (date) => date.id)) {
      ctx.addIssue({ code: 'custom', message: 'Duplicate availableDates id', path: ['availableDates'] });
    }
    if (!uniqueBy(feed.reviews, (review) => review.id)) {
      ctx.addIssue({ code: 'custom', message: 'Duplicate review id', path: ['reviews'] });
    }
    if (!uniqueBy(feed.transportOptions, (option) => option)) {
      ctx.addIssue({ code: 'custom', message: 'Duplicate transport option', path: ['transportOptions'] });
    }

    for (const tier of feed.accommodationTiers) {
      if (!uniqueBy(tier.rooms, (room) => room.id)) {
        ctx.addIssue({ code: 'custom', message: `Duplicate room id in tier "${tier.id}"`, path: ['accommodationTiers'] });
      }
      const stops = tier.itinerary.flatMap((day) => day.stops);
      if (!uniqueBy(stops, (stop) => stop.id)) {
        ctx.addIssue({ code: 'custom', message: `Duplicate itinerary stop id in tier "${tier.id}"`, path: ['accommodationTiers'] });
      }
      if (!uniqueBy(tier.itinerary, (day) => String(day.day))) {
        ctx.addIssue({ code: 'custom', message: `Duplicate itinerary day in tier "${tier.id}"`, path: ['accommodationTiers'] });
      }
    }

    feed.availableDates.forEach((date, index) => {
      if (date.spots > feed.experience.capacity.maximum) {
        ctx.addIssue({
          code: 'custom',
          message: `availableDates spots (${date.spots}) exceed capacity.maximum (${feed.experience.capacity.maximum})`,
          path: ['availableDates', index, 'spots'],
        });
      }
    });
  });

export type ExperienceFeedV2 = z.infer<typeof ExperienceFeedV2Schema>;
