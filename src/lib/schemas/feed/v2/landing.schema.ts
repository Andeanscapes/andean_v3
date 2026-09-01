import { z } from 'zod';
import {
  AvailableDateSchema,
  DurationSchema,
  ExperienceIdSchema,
  FullLocationSchema,
  MediaPathSchema,
  PricingSchema,
  PublicationStatusSchema,
  SlugSchema,
  ReviewSchema,
  uniqueBy,
} from './common.schema';

/**
 * Landing's projection of one experience. Self-sufficient by design: the landing
 * page may fetch only `landing.json`, so this duplicates a bounded subset of
 * experience-owned values. Availability is included because the hero booking
 * card and featured cards render next-departure state.
 */
export const LandingExperienceV2Schema = z
  .object({
    id: ExperienceIdSchema,
    slug: SlugSchema,
    status: PublicationStatusSchema,
    media: z
      .object({
        hero: MediaPathSchema,
        card: MediaPathSchema,
      })
      .strict(),
    fromPrice: PricingSchema,
    /**
     * Optional during rollout: the published payload does not carry this field
     * yet, and this schema is `.strict()`, so requiring it would fail validation
     * against the live feed and take the landing page down.
     *
     * Tighten to required once `<base>/landing.json` carries it. Until then the
     * landing sticky bar must not interpolate a deposit percentage it may not have.
     */
    depositPercent: z.number().int().min(0).max(100).optional(),
    duration: DurationSchema,
    location: FullLocationSchema,
    availableDates: z.array(AvailableDateSchema),
  })
  .strict()
  .superRefine((experience, ctx) => {
    if (!uniqueBy(experience.availableDates, (date) => date.id)) {
      ctx.addIssue({ code: 'custom', message: 'Duplicate availableDates id', path: ['availableDates'] });
    }
  });

export const LandingFeedV2Schema = z
  .object({
    schemaVersion: z.literal(2),
    flagshipExperienceId: ExperienceIdSchema,
    featuredExperienceIds: z.array(ExperienceIdSchema).nonempty(),
    experiences: z.array(LandingExperienceV2Schema).nonempty(),
    featuredReviewIds: z.array(z.string().min(1)),
    reviews: z.array(ReviewSchema),
    /**
     * Brand-level media: hero background, final CTA background and the four
     * category tiles. CDN-relative `/images/...` paths resolved to absolute
     * URLs by `resolveMediaUrlsDeep` in `landing.service`. Optional only for the
     * staged strict-schema rollout; tighten after the published feed carries it.
     */
    media: z
      .object({
        hero: MediaPathSchema,
        finalCta: MediaPathSchema,
        categories: z
          .object({
            emeraldMining: MediaPathSchema,
            nature: MediaPathSchema,
            rural: MediaPathSchema,
            horseback: MediaPathSchema,
          })
          .strict(),
      })
      .strict()
      .optional(),
    /**
     * Aggregate over ALL reviews, not just the featured subset — the trust panel
     * advertises the total, so it cannot be derived from `reviews` alone.
     */
    reviewSummary: z
      .object({
        rating: z.number().min(1).max(5),
        count: z.number().int().nonnegative(),
      })
      .strict(),
    metrics: z
      .object({
        travelersHostedMinimum: z.number().int().positive(),
        recommendationPercent: z.number().int().min(0).max(100),
      })
      .strict(),
  })
  .strict()
  .superRefine((feed, ctx) => {
    const experienceIds = new Set(feed.experiences.map((experience) => experience.id));

    if (!experienceIds.has(feed.flagshipExperienceId)) {
      ctx.addIssue({
        code: 'custom',
        message: `flagshipExperienceId "${feed.flagshipExperienceId}" is not present in experiences`,
        path: ['flagshipExperienceId'],
      });
    }

    feed.featuredExperienceIds.forEach((id, index) => {
      if (!experienceIds.has(id)) {
        ctx.addIssue({
          code: 'custom',
          message: `featuredExperienceIds "${id}" is not present in experiences`,
          path: ['featuredExperienceIds', index],
        });
      }
    });

    const reviewIds = new Set(feed.reviews.map((review) => review.id));
    feed.featuredReviewIds.forEach((id, index) => {
      if (!reviewIds.has(id)) {
        ctx.addIssue({
          code: 'custom',
          message: `featuredReviewIds "${id}" is not present in reviews`,
          path: ['featuredReviewIds', index],
        });
      }
    });

    if (!uniqueBy(feed.experiences, (experience) => experience.id)) {
      ctx.addIssue({ code: 'custom', message: 'Duplicate experience id', path: ['experiences'] });
    }
    if (!uniqueBy(feed.reviews, (review) => review.id)) {
      ctx.addIssue({ code: 'custom', message: 'Duplicate review id', path: ['reviews'] });
    }
    if (feed.reviewSummary.count < feed.reviews.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'reviewSummary.count is lower than the number of published reviews',
        path: ['reviewSummary', 'count'],
      });
    }
  });

export type LandingExperienceV2 = z.infer<typeof LandingExperienceV2Schema>;
export type LandingFeedV2 = z.infer<typeof LandingFeedV2Schema>;
