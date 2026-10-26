import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ExperienceId } from '@/lib/schemas/feed/v2';
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

  it('keeps Chivor transport details for other experiences', () => {
    expect(getExperienceFaqKeys('chivorEmeraldCore')[2]).toMatchObject({
      question: 'experiences.ui.experienceDetails.faq3Q',
      answer: 'experiences.ui.experienceDetails.faq3A',
    });
  });
});
