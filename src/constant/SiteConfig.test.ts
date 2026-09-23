/**
 * The dialable number and its rendered form are derived from one env value, so
 * they cannot drift. These assertions exist because an earlier revision rendered
 * the raw digits in the footer after the display constant was dropped.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('CONTACT_INFO', () => {
  beforeEach(() => {
    vi.resetModules();
  });

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

/**
 * The footer tiles are served from the CDN, so the paths must stay in the
 * `/images/` form `resolveMediaUrl` rewrites. A `/assets/...` path would pass
 * through untouched and silently serve a repo-local file that no longer exists.
 */
describe('FOOTER_TRUST_GALLERY', () => {
  beforeEach(() => {
    vi.resetModules();
  });

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
