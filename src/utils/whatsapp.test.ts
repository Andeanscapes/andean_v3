import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('whatsappUrl', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('uses the configured public phone number and encodes the message', async () => {
    vi.stubEnv('NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER', '573134375813');
    const { whatsappUrl } = await import('./whatsapp');

    expect(whatsappUrl("I'm interested")).toBe(
      "https://wa.me/573134375813?text=I'm%20interested",
    );
  });

  it('omits the query string when no message is supplied', async () => {
    vi.stubEnv('NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER', '573134375813');
    const { whatsappUrl } = await import('./whatsapp');

    expect(whatsappUrl()).toBe('https://wa.me/573134375813');
  });
});
