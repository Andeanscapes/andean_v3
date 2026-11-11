import { cache } from 'react';
import { createTranslator } from 'next-intl';
import { z } from 'zod';
import type { Locale } from '@/i18n/routing';
import type { EmeraldMessageFile, EmeraldPage } from '@/lib/content/emeralds.structure';

/**
 * Emerald World copy is long-form and server-only, like the guides copy, and is
 * split per pillar so a page only loads its own file.
 *
 * Static imports: the Workers bundler cannot analyze template-literal imports
 * (same constraint as `src/i18n/request.ts`).
 */
type MessageLoader = () => Promise<{ default: Record<string, unknown> }>;

const commonLoaders: Record<Locale, MessageLoader> = {
  en: () => import('@/i18n/messages/emeralds/en/common.json'),
  es: () => import('@/i18n/messages/emeralds/es/common.json'),
  fr: () => import('@/i18n/messages/emeralds/fr/common.json'),
  de: () => import('@/i18n/messages/emeralds/de/common.json'),
  it: () => import('@/i18n/messages/emeralds/it/common.json'),
};

const pageLoaders: Record<Locale, Record<EmeraldMessageFile, MessageLoader>> = {
  en: {
    hub: () => import('@/i18n/messages/emeralds/en/hub.json'),
    'fuego-verde': () => import('@/i18n/messages/emeralds/en/fuego-verde.json'),
    mythology: () => import('@/i18n/messages/emeralds/en/mythology.json'),
    'green-wars': () => import('@/i18n/messages/emeralds/en/green-wars.json'),
    'famous-emeralds': () => import('@/i18n/messages/emeralds/en/famous-emeralds.json'),
    culture: () => import('@/i18n/messages/emeralds/en/culture.json'),
    gemology: () => import('@/i18n/messages/emeralds/en/gemology.json'),
    mines: () => import('@/i18n/messages/emeralds/en/mines.json'),
  },
  es: {
    hub: () => import('@/i18n/messages/emeralds/es/hub.json'),
    'fuego-verde': () => import('@/i18n/messages/emeralds/es/fuego-verde.json'),
    mythology: () => import('@/i18n/messages/emeralds/es/mythology.json'),
    'green-wars': () => import('@/i18n/messages/emeralds/es/green-wars.json'),
    'famous-emeralds': () => import('@/i18n/messages/emeralds/es/famous-emeralds.json'),
    culture: () => import('@/i18n/messages/emeralds/es/culture.json'),
    gemology: () => import('@/i18n/messages/emeralds/es/gemology.json'),
    mines: () => import('@/i18n/messages/emeralds/es/mines.json'),
  },
  fr: {
    hub: () => import('@/i18n/messages/emeralds/fr/hub.json'),
    'fuego-verde': () => import('@/i18n/messages/emeralds/fr/fuego-verde.json'),
    mythology: () => import('@/i18n/messages/emeralds/fr/mythology.json'),
    'green-wars': () => import('@/i18n/messages/emeralds/fr/green-wars.json'),
    'famous-emeralds': () => import('@/i18n/messages/emeralds/fr/famous-emeralds.json'),
    culture: () => import('@/i18n/messages/emeralds/fr/culture.json'),
    gemology: () => import('@/i18n/messages/emeralds/fr/gemology.json'),
    mines: () => import('@/i18n/messages/emeralds/fr/mines.json'),
  },
  de: {
    hub: () => import('@/i18n/messages/emeralds/de/hub.json'),
    'fuego-verde': () => import('@/i18n/messages/emeralds/de/fuego-verde.json'),
    mythology: () => import('@/i18n/messages/emeralds/de/mythology.json'),
    'green-wars': () => import('@/i18n/messages/emeralds/de/green-wars.json'),
    'famous-emeralds': () => import('@/i18n/messages/emeralds/de/famous-emeralds.json'),
    culture: () => import('@/i18n/messages/emeralds/de/culture.json'),
    gemology: () => import('@/i18n/messages/emeralds/de/gemology.json'),
    mines: () => import('@/i18n/messages/emeralds/de/mines.json'),
  },
  it: {
    hub: () => import('@/i18n/messages/emeralds/it/hub.json'),
    'fuego-verde': () => import('@/i18n/messages/emeralds/it/fuego-verde.json'),
    mythology: () => import('@/i18n/messages/emeralds/it/mythology.json'),
    'green-wars': () => import('@/i18n/messages/emeralds/it/green-wars.json'),
    'famous-emeralds': () => import('@/i18n/messages/emeralds/it/famous-emeralds.json'),
    culture: () => import('@/i18n/messages/emeralds/it/culture.json'),
    gemology: () => import('@/i18n/messages/emeralds/it/gemology.json'),
    mines: () => import('@/i18n/messages/emeralds/it/mines.json'),
  },
};

/**
 * How a section's claims are backed. Without a note every paragraph and the
 * answer must carry at least one `[[sourceId]]` marker. `fieldNote` is our own
 * observation, `oralTradition` a story told locally that no document confirms,
 * `editorial` text about Andean Scapes itself.
 */
export const EMERALD_SECTION_NOTES = ['fieldNote', 'oralTradition', 'editorial'] as const;

const EmeraldSectionSchema = z.object({
  heading: z.string().min(1),
  note: z.enum(EMERALD_SECTION_NOTES).optional(),
  /** Self-contained 40–60 word answer to the heading, shown before the body. */
  answer: z.string().min(1).optional(),
  paragraphs: z.array(z.string().min(1)).min(1),
  list: z.array(z.string().min(1)).min(1).optional(),
  quote: z.object({ text: z.string().min(1), attribution: z.string().min(1) }).optional(),
  timeline: z.array(z.object({ date: z.string().min(1), text: z.string().min(1) })).min(1).optional(),
  /** Copy for a registry `figure` or `illustration` on this section. */
  figure: z.object({ alt: z.string().min(1), caption: z.string().min(1) }).optional(),
});

const EmeraldAuthorCopySchema = z.object({ jobTitle: z.string().min(1), bio: z.string().min(1) });

const EmeraldPageCopySchema = z.object({
  /** Short label in the section navigation; required for pillars. */
  navLabel: z.string().min(1).optional(),
  metaTitle: z.string().min(1),
  metaDescription: z.string().min(1),
  title: z.string().min(1),
  lead: z.string().min(1),
  imageAlt: z.string().min(1),
  sections: z.record(z.string(), EmeraldSectionSchema),
  /** Visible questions and answers; answers carry `[[sourceId]]` markers. */
  faq: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })).min(1).optional(),
});

export type EmeraldSection = z.infer<typeof EmeraldSectionSchema> & { id: string };

export interface EmeraldContent {
  navLabel?: string;
  metaTitle: string;
  metaDescription: string;
  title: string;
  lead: string;
  imageAlt: string;
  sections: EmeraldSection[];
  faq?: { question: string; answer: string }[];
}

// Messages are loaded at runtime, so keys are cast; the schema validates the shape.
const getCommonTranslator = cache(async (locale: Locale) =>
  createTranslator({ locale, messages: (await commonLoaders[locale]()).default }),
);

const getPageMessages = cache(
  async (locale: Locale, file: EmeraldMessageFile) => (await pageLoaders[locale][file]()).default,
);

/** UI strings shared by every Emerald World page. */
export async function getEmeraldsUiSSR(locale: Locale) {
  const t = await getCommonTranslator(locale);
  return (key: string, values?: Record<string, string | number>) => t(key as Parameters<typeof t>[0], values as Parameters<typeof t>[1]);
}

/**
 * Pattern: load → validate → project. Throws if a registered section has no
 * copy, so a missing translation fails the build loudly.
 */
export async function getEmeraldContentSSR(locale: Locale, page: EmeraldPage): Promise<EmeraldContent> {
  const messages = await getPageMessages(locale, page.messageFile);
  const pages = z.record(z.string(), z.unknown()).parse(messages.pages);
  const copy = EmeraldPageCopySchema.parse(pages[page.id]);

  const sections = page.sectionIds.map((id) => {
    const section = copy.sections[id];
    if (!section) throw new Error(`[Emeralds] Missing section "${id}" for "${page.id}" in ${locale}`);
    return { id, ...section };
  });

  return { ...copy, sections };
}

/** Job title and bio of a registered author, in `common.json` under `authors.<id>`. */
export async function getEmeraldAuthorCopySSR(locale: Locale, authorId: string) {
  const t = await getCommonTranslator(locale);
  return EmeraldAuthorCopySchema.parse(t.raw(`authors.${authorId}` as Parameters<typeof t.raw>[0]));
}
