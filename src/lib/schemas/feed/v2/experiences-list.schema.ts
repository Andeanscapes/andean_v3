import { z } from 'zod';
import {
  BadgeCodeSchema,
  CardLocationSchema,
  DurationSchema,
  ExperienceIdSchema,
  HighlightCodeSchema,
  MediaPathSchema,
  PricingSchema,
  PublicationStatusSchema,
  SlugSchema,
  uniqueBy,
} from './common.schema';

/**
 * One catalog entry. Self-sufficient by design: `/experiences` may fetch only
 * `experiences-list.json`, so the card projection duplicates a bounded subset of
 * experience-owned values (price, duration, location, media). The experience
 * resource stays the canonical owner; `contract.test.ts` enforces equality.
 *
 * Booking inventory (rooms, capacity, transport pricing, add-ons, itinerary)
 * is deliberately absent — that belongs only to the experience resource.
 */
export const ExperiencesListEntryV2Schema = z
  .object({
    id: ExperienceIdSchema,
    slug: SlugSchema,
    status: PublicationStatusSchema,
    card: z
      .object({
        image: MediaPathSchema,
        fromPrice: PricingSchema,
        duration: DurationSchema,
        location: CardLocationSchema,
        badgeCode: BadgeCodeSchema.optional(),
        highlightCodes: z.array(HighlightCodeSchema).max(3).default([]),
      })
      .strict(),
  })
  .strict();

export const ExperiencesListFeedV2Schema = z
  .object({
    schemaVersion: z.literal(2),
    /** Array order is the catalog order. */
    experiences: z.array(ExperiencesListEntryV2Schema),
  })
  .strict()
  .superRefine((feed, ctx) => {
    if (!uniqueBy(feed.experiences, (entry) => entry.id)) {
      ctx.addIssue({ code: 'custom', message: 'Duplicate experience id', path: ['experiences'] });
    }
    if (!uniqueBy(feed.experiences, (entry) => entry.slug)) {
      ctx.addIssue({ code: 'custom', message: 'Duplicate experience slug', path: ['experiences'] });
    }
  });

export type ExperiencesListEntryV2 = z.infer<typeof ExperiencesListEntryV2Schema>;
export type ExperiencesListFeedV2 = z.infer<typeof ExperiencesListFeedV2Schema>;
