import { describe, expect, it } from 'vitest';
import { locales } from '@/i18n/routing';
import {
  EMERALD_AUTHORS,
  EMERALD_PAGES,
  MIN_RELATED_LINKS,
  emeraldPath,
  getEmeraldAuthorById,
  getEmeraldPageById,
  getEmeraldPageBySegments,
  getEmeraldTrail,
} from '@/lib/content/emeralds.structure';
import { GUIDES, getGuideBySlug } from '@/lib/content/guides.structure';
import { EMERALD_ENTITIES } from '@/lib/content/emeraldEntities';
import * as SOURCES from '@/lib/content/sources';
import { citedSourceIds } from '@/utils/citations';
import { getEmeraldAuthorCopySSR, getEmeraldContentSSR, getEmeraldsUiSSR } from './emeralds.service';

const isDocumentedPage = (kind: string) => kind === 'article' || kind === 'episode';

describe('emerald registry', () => {
  it('has unique ids and paths, and resolves each path', () => {
    const ids = EMERALD_PAGES.map((page) => page.id);
    const paths = EMERALD_PAGES.map(emeraldPath);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(paths).size).toBe(paths.length);
    for (const page of EMERALD_PAGES) expect(getEmeraldPageBySegments(page.segments)).toBe(page);
    expect(getEmeraldPageBySegments(['unknown'])).toBeUndefined();
  });

  it('has exactly one hub, at /emeralds', () => {
    const hubs = EMERALD_PAGES.filter((page) => page.kind === 'hub');
    expect(hubs).toHaveLength(1);
    expect(emeraldPath(hubs[0])).toBe('/emeralds');
    expect(hubs[0].parentId).toBeUndefined();
  });

  it('returns no page for unknown or deeper paths, so the route 404s', () => {
    expect(getEmeraldPageBySegments(['mythology', 'unknown'])).toBeUndefined();
    expect(getEmeraldPageBySegments(['', ''])).toBeUndefined();
  });

  it('gives the hub a one-step trail (breadcrumb: Home > Emerald World)', () => {
    const hub = getEmeraldPageById('hub')!;
    expect(getEmeraldTrail(hub)).toEqual([hub]);
  });

  it('nests every other page under an existing parent, reaching the hub without cycles', () => {
    for (const page of EMERALD_PAGES.filter((item) => item.kind !== 'hub')) {
      expect(page.parentId && getEmeraldPageById(page.parentId)).toBeTruthy();
      const trail = getEmeraldTrail(page);
      expect(trail[0].kind).toBe('hub');
      expect(trail.at(-1)).toBe(page);
      const parent = getEmeraldPageById(page.parentId!);
      expect(page.segments.slice(0, -1)).toEqual(parent?.segments);
    }
  });

  it('links only to pages that exist, never to itself', () => {
    for (const page of EMERALD_PAGES) {
      for (const link of page.related) {
        if (link.type === 'guide') expect(getGuideBySlug(link.slug), link.slug).toBeDefined();
        else {
          expect(getEmeraldPageById(link.id), link.id).toBeDefined();
          expect(link.id).not.toBe(page.id);
        }
      }
    }
  });

  it('cites at least one source per page, linked over https', () => {
    for (const page of EMERALD_PAGES) {
      expect(page.sources.length).toBeGreaterThan(0);
      for (const source of page.sources) if (source.url) expect(source.url).toMatch(/^https:\/\//);
    }
  });
});

describe('getEmeraldContentSSR', () => {
  it.each(locales)('has every registered section for every page in %s', async (locale) => {
    for (const page of EMERALD_PAGES) {
      const content = await getEmeraldContentSSR(locale, page);
      expect(content.sections.map((section) => section.id)).toEqual([...page.sectionIds]);
      expect(content.title).not.toBe('');
    }
  });

  it.each(locales)('has chrome copy in %s', async (locale) => {
    const ui = await getEmeraldsUiSSR(locale);
    for (const key of [
      'ui.breadcrumbEmeralds',
      'ui.breadcrumbLabel',
      'ui.updated',
      'ui.author',
      'ui.sourcesTitle',
      'ui.relatedTitle',
      'ui.visitTitle',
      'ui.visitBody',
      'ui.visitCta',
    ]) {
      expect(ui(key)).not.toContain(key);
    }
  });
});

describe('editorial sources', () => {
  const all = Object.values(SOURCES).filter((value): value is SOURCES.EditorialSource => typeof value === 'object');

  it('have unique kebab-case ids and a language', () => {
    const ids = all.map((source) => source.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const source of all) {
      expect(source.id).toMatch(/^[a-z0-9-]+$/);
      expect(locales).toContain(source.language);
    }
  });
});

describe('emerald citations', () => {
  it.each(locales)('cite only listed sources, cite every listed source, and back every uncited-by-design section with a note (%s)', async (locale) => {
    for (const page of EMERALD_PAGES) {
      const content = await getEmeraldContentSSR(locale, page);
      const listed = new Set(page.sources.map((source) => source.id));
      const cited = new Set<string>();

      for (const section of content.sections) {
        const texts = [
          section.answer,
          ...section.paragraphs,
          ...(section.list ?? []),
          section.quote?.text,
          ...(section.timeline ?? []).map((entry) => entry.text),
        ].filter((text): text is string => text !== undefined);
        for (const text of texts) for (const id of citedSourceIds(text)) cited.add(id);

        // A section without a note is documented fact: answer and every paragraph carry a source.
        if (!section.note) {
          for (const text of [section.answer, ...section.paragraphs].filter((t): t is string => t !== undefined)) {
            expect(citedSourceIds(text).length, `${page.id}/${section.id}: "${text.slice(0, 60)}…"`).toBeGreaterThan(0);
          }
        }
        for (const plain of [section.heading, section.figure?.alt, section.figure?.caption]) {
          if (plain) expect(citedSourceIds(plain), `${page.id}/${section.id}`).toEqual([]);
        }
      }

      for (const plain of [content.title, content.lead, content.metaTitle, content.metaDescription, content.imageAlt]) {
        expect(citedSourceIds(plain)).toEqual([]);
      }
      for (const item of content.faq ?? []) {
        expect(citedSourceIds(item.question), `${page.id} faq`).toEqual([]);
        expect(citedSourceIds(item.answer).length, `${page.id} faq: ${item.question}`).toBeGreaterThan(0);
        for (const id of citedSourceIds(item.answer)) cited.add(id);
      }
      expect(Array.from(cited).filter((id) => !listed.has(id)), page.id).toEqual([]);
      expect(Array.from(listed).filter((id) => !cited.has(id)), `${page.id}: listed but never cited`).toEqual([]);
    }
  });
});

describe('emerald media, navigation and authors', () => {
  it.each(locales)('has figure copy for every registered figure or illustration (%s)', async (locale) => {
    for (const page of EMERALD_PAGES) {
      const content = await getEmeraldContentSSR(locale, page);
      for (const [sectionId, media] of Object.entries(page.media ?? {})) {
        expect(page.sectionIds, `${page.id}: media on unknown section ${sectionId}`).toContain(sectionId);
        expect(content.sections.find((section) => section.id === sectionId)?.figure, `${page.id}/${sectionId}`).toBeDefined();
        if (media?.type === 'figure') {
          expect(media.src).toMatch(/^\/images\/.+\.webp$/);
          expect(media.credit.trim()).not.toBe('');
          expect(media.license.trim()).not.toBe('');
        }
      }
    }
  });

  // Google truncates longer titles and descriptions in results.
  it.each(locales)('keeps titles within 60 and descriptions within 160 characters (%s)', async (locale) => {
    for (const page of EMERALD_PAGES) {
      const content = await getEmeraldContentSSR(locale, page);
      expect(content.metaTitle.length, `${page.id}: ${content.metaTitle}`).toBeLessThanOrEqual(60);
      expect(content.metaDescription.length, `${page.id}: ${content.metaDescription}`).toBeLessThanOrEqual(160);
    }
  });

  it('declares what every page is about with known, unique entities', () => {
    for (const page of EMERALD_PAGES) {
      expect(page.about.length, page.id).toBeGreaterThan(0);
      expect(new Set(page.about).size, page.id).toBe(page.about.length);
      for (const id of page.about) expect(EMERALD_ENTITIES[id], `${page.id}: ${id}`).toBeDefined();
    }
    for (const entity of Object.values(EMERALD_ENTITIES)) expect(entity.wikidata).toMatch(/^Q\d+$/);
  });

  it('links guides only to Emerald World pages that exist', () => {
    for (const guide of GUIDES) {
      for (const id of guide.emeraldLinks ?? []) expect(getEmeraldPageById(id), `${guide.slug}: ${id}`).toBeDefined();
    }
  });

  it.each(locales)('gives every topic section a short navigation label (%s)', async (locale) => {
    for (const page of EMERALD_PAGES.filter((item) => item.kind === 'pillar')) {
      expect((await getEmeraldContentSSR(locale, page)).navLabel, page.id).toBeTruthy();
    }
  });

  // Until the first author is registered the byline is the Andean Scapes team;
  // a page that names an author must name a registered one.
  it('links articles and episodes to enough related pages and only to registered authors', () => {
    for (const page of EMERALD_PAGES.filter((item) => isDocumentedPage(item.kind))) {
      if (page.authorId) expect(getEmeraldAuthorById(page.authorId), `${page.id}: author`).toBeDefined();
      expect(page.related.length, `${page.id}: related`).toBeGreaterThanOrEqual(MIN_RELATED_LINKS);
    }
  });

  // Documentary and memory pages never point to the tours; only the hub may.
  it('keeps every page except the hub free of tour links', () => {
    for (const page of EMERALD_PAGES.filter((item) => item.kind !== 'hub')) {
      expect(page.commercial, page.id).toBe('none');
    }
  });

  it('nests pages under the section whose message file they share', () => {
    for (const page of EMERALD_PAGES.filter((item) => isDocumentedPage(item.kind))) {
      expect(getEmeraldPageById(page.parentId!)?.messageFile, page.id).toBe(page.messageFile);
    }
  });

  it.each(locales)('has unique authors with bio copy and https profiles (%s)', async (locale) => {
    expect(new Set(EMERALD_AUTHORS.map((author) => author.slug)).size).toBe(EMERALD_AUTHORS.length);
    for (const author of EMERALD_AUTHORS) {
      const copy = await getEmeraldAuthorCopySSR(locale, author.id);
      expect(copy.bio).not.toBe('');
      for (const url of author.sameAs) expect(url).toMatch(/^https:\/\//);
    }
  });

  it.each(locales)('has illustration and note copy in %s', async (locale) => {
    const ui = await getEmeraldsUiSSR(locale);
    for (const key of [
      'notes.fieldNote',
      'notes.oralTradition',
      'illustrations.beltMap.western',
      'illustrations.beltMap.eastern',
      'illustrations.beltMap.credit',
      'illustrations.trapiche.core',
      'illustrations.trapiche.arm',
      'illustrations.trapiche.sector',
      'illustrations.trapiche.credit',
      'illustrations.threePhase.liquid',
      'illustrations.threePhase.gas',
      'illustrations.threePhase.crystal',
      'illustrations.threePhase.credit',
      ...locales.map((code) => `ui.sourceLanguage.${code}`),
      'ui.tocLabel',
      'ui.sectionNavLabel',
      'ui.pagerLabel',
      'ui.previous',
      'ui.next',
      'ui.authorPagesTitle',
      'ui.faqTitle',
    ]) {
      expect(ui(key)).not.toContain(key);
    }
    expect(ui('ui.sourceRef', { number: 3 })).toContain('3');
  });
});
