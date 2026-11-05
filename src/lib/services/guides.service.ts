import { cache } from 'react';
import { createTranslator } from 'next-intl';
import { z } from 'zod';
import type { Locale } from '@/i18n/routing';
import type { GuideDefinition } from '@/lib/content/guides.structure';

/**
 * Guide copy is long-form and only needed on guide routes, so it lives outside
 * the main message files (which the layout ships to the client) and is read
 * here on the server only.
 *
 * Static imports: the Workers bundler cannot analyze template-literal imports
 * (same constraint as `src/i18n/request.ts`).
 */
const guideMessageLoaders: Record<Locale, () => Promise<{ default: Record<string, unknown> }>> = {
  en: () => import('@/i18n/messages/guides/en.json'),
  es: () => import('@/i18n/messages/guides/es.json'),
  fr: () => import('@/i18n/messages/guides/fr.json'),
};

const GuideSectionSchema = z.object({
  heading: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).min(1),
});

const GuideArticleSchema = z.object({
  metaTitle: z.string().min(1),
  metaDescription: z.string().min(1),
  title: z.string().min(1),
  lead: z.string().min(1),
  imageAlt: z.string().min(1),
  sections: z.record(z.string(), GuideSectionSchema),
});

export type GuideSection = z.infer<typeof GuideSectionSchema> & { id: string };

export interface GuideContent {
  metaTitle: string;
  metaDescription: string;
  title: string;
  lead: string;
  imageAlt: string;
  sections: GuideSection[];
}

// Guide messages are loaded at runtime, so `createTranslator` cannot infer their
// key union and the keys below are cast. Safe: `GuideArticleSchema` validates
// the article shape, and `guides.service.test.ts` checks every chrome key.
const getGuideTranslator = cache(async (locale: Locale) => {
  const messages = (await guideMessageLoaders[locale]()).default;
  return createTranslator({ locale, messages });
});

/** UI strings for the guides hub and article chrome. */
export async function getGuidesUiSSR(locale: Locale) {
  const t = await getGuideTranslator(locale);
  return (key: string) => t(key as Parameters<typeof t>[0]);
}

/**
 * Pattern: load → validate → project. Throws if a section declared in the
 * registry has no copy, so a missing translation fails the build loudly.
 */
export async function getGuideContentSSR(locale: Locale, guide: GuideDefinition): Promise<GuideContent> {
  const t = await getGuideTranslator(locale);
  const article = GuideArticleSchema.parse(t.raw(`articles.${guide.id}` as Parameters<typeof t.raw>[0]));

  const sections = guide.sectionIds.map((id) => {
    const section = article.sections[id];
    if (!section) throw new Error(`[Guides] Missing section "${id}" for "${guide.id}" in ${locale}`);
    return { id, ...section };
  });

  return { ...article, sections };
}
