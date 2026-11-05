import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const createCheckoutLinkMock = vi.fn();
vi.mock('@/lib/services/mercadopago.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/services/mercadopago.service')>();
  return { ...actual, createCheckoutLink: (...args: unknown[]) => createCheckoutLinkMock(...args) };
});

import { POST } from './route';
import { PaymentError, type PaymentErrorCode } from '@/lib/services/mercadopago.service';

const VALID_BODY = {
  experienceId: 'chivorEmeraldCore',
  locale: 'es',
  selectedTierId: 'heritage',
  selectedDateId: 'nov-28-2026',
  roomSelections: [{ roomMode: 'standard_single', quantity: 1 }],
  transportMode: 'car_no_4x4',
  contact: { name: 'Ana Test', phone: '+57 300 000 0000', email: '' },
  termsAccepted: true,
};

const post = (body: unknown) =>
  new NextRequest('https://andeanscapes.com/api/payments/mercadopago', {
    method: 'POST',
    body: JSON.stringify(body),
  });

describe('POST /api/payments/mercadopago', () => {
  afterEach(() => createCheckoutLinkMock.mockReset());

  it('rejects an invalid body and a client-supplied amount', async () => {
    expect((await POST(post({ nope: true }))).status).toBe(400);
    expect((await POST(post({ ...VALID_BODY, depositAmount: 1 }))).status).toBe(400);
    expect(createCheckoutLinkMock).not.toHaveBeenCalled();
  });

  it('returns the checkout URL without caching', async () => {
    const checkout = {
      url: 'https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=1',
      reference: '3f2c1d4e-5a6b-4c7d-8e9f-0a1b2c3d4e5f',
    };
    createCheckoutLinkMock.mockResolvedValue(checkout);

    const response = await POST(post(VALID_BODY));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(checkout);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(createCheckoutLinkMock).toHaveBeenCalledWith(VALID_BODY, 'https://andeanscapes.com');
  });

  it.each<[PaymentErrorCode, number]>([
    ['invalid_request', 400],
    ['unavailable', 409],
    ['not_configured', 503],
    ['provider_error', 502],
  ])('maps %s to %i with only the code in the body', async (code, status) => {
    createCheckoutLinkMock.mockRejectedValue(new PaymentError(code, 'internal detail'));

    const response = await POST(post(VALID_BODY));

    expect(response.status).toBe(status);
    await expect(response.json()).resolves.toEqual({ code });
  });
});
