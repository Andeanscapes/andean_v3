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
