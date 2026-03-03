/**
 * Zod schemas for experiences list validation
 */

import { z } from 'zod';

// Experience hero badge
export const ExperienceHeroBadgeSchema = z.object({
  labelKey: z.string(),
  icon: z.enum(['limited', 'deposit', 'none']),
});

// Experiences list hero config
export const ExperiencesListHeroConfigSchema = z.object({
  titleKey: z.string(),
  subtitleKey: z.string(),
  summaryKey: z.string(),
  highlightTextKey: z.string(),
  ctaLabelKey: z.string(),
  helperTextKey: z.string(),
  ctaTargetId: z.string(),
  badges: z.array(ExperienceHeroBadgeSchema),
});

// Experience card config
export const ExperienceCardConfigSchema = z.object({
  id: z.string(),
  titleKey: z.string(),
  descriptionKey: z.string(),
  image: z.string(),
  href: z.string(),
  tagKey: z.string(),
  trustKey: z.string(),
  price: z.number().optional(),
  experienceId: z.string().optional(),
});

// Experiences list config
export const ExperiencesListConfigSchema = z.object({
  metaTitleKey: z.string(),
  metaDescriptionKey: z.string(),
  sectionTitleKey: z.string(),
  sectionSubtitleKey: z.string(),
  fromLabelKey: z.string(),
  viewDetailsKey: z.string(),
  hero: ExperiencesListHeroConfigSchema,
  cards: z.array(ExperienceCardConfigSchema),
});

// Experience list card (translated version)
export const ExperienceListCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  image: z.string(),
  price: z.number(),
  href: z.string(),
  tag: z.string(),
  trust: z.string(),
});

// Experiences list data (translated version)
export const ExperiencesListDataSchema = z.object({
  metaTitle: z.string(),
  metaDescription: z.string(),
  sectionTitle: z.string(),
  sectionSubtitle: z.string(),
  fromLabel: z.string(),
  viewDetails: z.string(),
  hero: z.any(), // ExperienceHeroContent from experience schema
  cards: z.array(ExperienceListCardSchema),
});

// Export inferred TypeScript types
export type ExperiencesListConfig = z.infer<typeof ExperiencesListConfigSchema>;
export type ExperienceCardConfig = z.infer<typeof ExperienceCardConfigSchema>;
export type ExperiencesListHeroConfig = z.infer<typeof ExperiencesListHeroConfigSchema>;
export type ExperienceHeroBadge = z.infer<typeof ExperienceHeroBadgeSchema>;
export type ExperienceListCard = z.infer<typeof ExperienceListCardSchema>;
export type ExperiencesListData = z.infer<typeof ExperiencesListDataSchema>;
