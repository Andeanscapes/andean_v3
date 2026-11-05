import { describe, expect, it } from 'vitest';
import { locales } from '@/i18n/routing';
import { GUIDES, getGuideBySlug, guidePath } from '@/lib/content/guides.structure';
import { getGuideContentSSR, getGuidesUiSSR } from './guides.service';

describe('guides registry', () => {
  it('has unique slugs and resolves them', () => {
    const slugs = GUIDES.map((guide) => guide.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(getGuideBySlug(slug)?.slug).toBe(slug);
    expect(getGuideBySlug('unknown')).toBeUndefined();
  });

  it('builds locale-free paths', () => {
    expect(guidePath()).toBe('/guides');
    expect(guidePath('chivor-emerald-mine-history')).toBe('/guides/chivor-emerald-mine-history');
  });

  it('publishes no Coscuez media while Coscuez has no dates', () => {
    for (const guide of GUIDES) {
      expect(guide.image).not.toMatch(/coscuez/i);
      expect(guide.cardImage).not.toMatch(/coscuez/i);
    }
  });

  it('only links sources over https', () => {
    for (const guide of GUIDES) {
      for (const source of guide.sources) {
        if (source.url) expect(source.url).toMatch(/^https:\/\//);
      }
    }
  });
});

describe('getGuideContentSSR', () => {
  it.each(locales)('has every registered section for every guide in %s', async (locale) => {
    for (const guide of GUIDES) {
      const content = await getGuideContentSSR(locale, guide);
      expect(content.sections.map((section) => section.id)).toEqual([...guide.sectionIds]);
      expect(content.title).not.toBe('');
    }
  });

  it.each(locales)('has hub and chrome copy in %s', async (locale) => {
    const ui = await getGuidesUiSSR(locale);
    for (const key of ['hub.metaTitle', 'hub.title', 'ui.breadcrumbGuides', 'ui.sourcesTitle', 'ui.breadcrumbLabel', 'hub.imageAlt']) {
      expect(ui(key)).not.toContain(key);
    }
  });
});
