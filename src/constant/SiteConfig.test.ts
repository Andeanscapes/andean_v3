import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ExperienceId } from '@/lib/schemas/feed/v2';
import { EXPERIENCE_METADATA_NAMESPACE } from '@/i18n/mappings/experience';
import { locales } from '@/i18n/routing';
import en from '@/i18n/messages/en.json';
import es from '@/i18n/messages/es.json';
import fr from '@/i18n/messages/fr.json';
import de from '@/i18n/messages/de.json';
import itMessages from '@/i18n/messages/it.json';
import { getExperienceFaqKeys } from './SiteConfig';

afterEach(() => vi.unstubAllEnvs());

describe('CONTACT_INFO', () => {
  beforeEach(() => vi.resetModules());

  it('derives a formatted display value from the configured digits', async () => {
    vi.stubEnv('NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER', '573134375813');
    const { CONTACT_INFO } = await import('./SiteConfig');
    expect(CONTACT_INFO.phone).toBe('573134375813');
    expect(CONTACT_INFO.phoneDisplay).toBe('+57 313-4375813');
  });

  it('falls back to a plain international form for an unexpected shape', async () => {
    vi.stubEnv('NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER', '4915112345678');
    const { CONTACT_INFO } = await import('./SiteConfig');
    expect(CONTACT_INFO.phoneDisplay).toBe('+4915112345678');
  });

  it('stays empty rather than inventing a number when unconfigured', async () => {
    vi.stubEnv('NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER', '');
    const { CONTACT_INFO } = await import('./SiteConfig');
    expect(CONTACT_INFO.phone).toBe('');
    expect(CONTACT_INFO.phoneDisplay).toBe('');
  });
});

describe('FOOTER_TRUST_GALLERY', () => {
  beforeEach(() => vi.resetModules());

  it('holds CDN-relative media paths', async () => {
    const { FOOTER_TRUST_GALLERY } = await import('./SiteConfig');
    expect(FOOTER_TRUST_GALLERY.length).toBeGreaterThan(0);
    for (const path of FOOTER_TRUST_GALLERY) {
      expect(path).toMatch(/^\/images\/brand\/footer\/[\w-]+\.webp$/);
    }
  });

  it('resolves every path onto the CDN base', async () => {
    vi.stubEnv('NEXT_PUBLIC_CDN_BASE_URL', 'https://cdn.example.com');
    const { FOOTER_TRUST_GALLERY } = await import('./SiteConfig');
    const { resolveMediaUrl } = await import('@/utils/mediaUrl');
    for (const path of FOOTER_TRUST_GALLERY) {
      expect(resolveMediaUrl(path)).toBe(`https://cdn.example.com${path}`);
    }
  });

  it('has no duplicate tiles', async () => {
    const { FOOTER_TRUST_GALLERY } = await import('./SiteConfig');
    expect(new Set(FOOTER_TRUST_GALLERY).size).toBe(FOOTER_TRUST_GALLERY.length);
  });
});

describe('getExperienceFaqKeys', () => {
  it('uses Borbur logistics for Coscuez instead of Chivor transport details', () => {
    const coscuezIds: readonly ExperienceId[] = ['coscuezEmeraldCore', 'coscuezEmeraldPrime'];
    for (const id of coscuezIds) {
      expect(getExperienceFaqKeys(id)[2]).toMatchObject({
        question: 'experiences.ui.experienceDetails.coscuezTransportFaqQ',
        answer: 'experiences.ui.experienceDetails.coscuezTransportFaqA',
      });
    }
  });

  it('uses the shared Chivor route answer for Chivor experiences', () => {
    expect(getExperienceFaqKeys('chivorEmeraldCore')[2]).toMatchObject({
      question: 'Landing.faqs.items.transportHelp.question',
      answer: 'Landing.faqs.items.transportHelp.answer',
    });
  });

  const experienceIds = Object.keys(EXPERIENCE_METADATA_NAMESPACE) as ExperienceId[];
  const messages = { en, es, fr, de, it: itMessages };

  const lookup = (tree: unknown, key: string): unknown =>
    key.split('.').reduce<unknown>(
      (node, part) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined),
      tree,
    );

  it.each(experienceIds)('%s: every FAQ key resolves in en, es and fr', (id) => {
    for (const locale of locales) {
      for (const faq of getExperienceFaqKeys(id)) {
        expect(typeof lookup(messages[locale], faq.question), `${locale} ${faq.question}`).toBe('string');
        expect(typeof lookup(messages[locale], faq.answer), `${locale} ${faq.answer}`).toBe('string');
      }
    }
  });

  it.each(experienceIds)('%s: FAQ ids are unique and the first is the default-open item', (id) => {
    const ids = getExperienceFaqKeys(id).map((faq) => faq.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids[0]).toBe('faq-1');
  });
});
