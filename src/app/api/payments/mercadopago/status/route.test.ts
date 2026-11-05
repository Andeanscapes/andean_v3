import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const BUILT_ALERT = { title: 't', isSandbox: true, lines: [], paymentId: '123', externalReference: 'r' };
const getPaymentStatusMock = vi.fn();
const dispatchMock = vi.fn(async (..._args: unknown[]): Promise<void> => undefined);
const buildMock = vi.fn(async (..._args: unknown[]) => BUILT_ALERT);
const hasChannelMock = vi.fn(() => true);
const waitUntilMock = vi.fn();

vi.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: () => ({ ctx: { waitUntil: waitUntilMock } }),
}));
vi.mock('@/lib/services/payment-alert.service', () => ({
  buildPaymentAlert: (...args: unknown[]) => buildMock(...args),
  hasAlertChannel: () => hasChannelMock(),
  dispatchPaymentAlert: (...args: unknown[]) => dispatchMock(...args),
}));
vi.mock('@/lib/services/mercadopago.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/services/mercadopago.service')>();
  return { ...actual, getPaymentStatus: (...args: unknown[]) => getPaymentStatusMock(...args) };
});

import { GET } from './route';
import { PaymentError } from '@/lib/services/mercadopago.service';

const REF = '3f2c1d4e-5a6b-4c7d-8e9f-0a1b2c3d4e5f';
const request = (query: string) => new NextRequest(`https://andeanscapes.com/api/payments/mercadopago/status?${query}`);

describe('GET /api/payments/mercadopago/status', () => {
  afterEach(() => {
    getPaymentStatusMock.mockReset();
    dispatchMock.mockReset();
    buildMock.mockClear();
    hasChannelMock.mockReturnValue(true);
    waitUntilMock.mockClear();
    vi.restoreAllMocks();
  });

  it('queues the operator alert after the response when the payment is approved', async () => {
    const approvedPayment = { paymentId: '123', externalReference: REF, amount: 1, metadata: {}, isSandbox: true };
    getPaymentStatusMock.mockResolvedValue({ status: 'approved', approvedPayment });

    const response = await GET(request(`ref=${REF}&payment_id=123`));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: 'approved' });
    // Built inside the request (translations need request scope), sent after it.
    expect(buildMock).toHaveBeenCalledWith(approvedPayment);
    expect(dispatchMock).toHaveBeenCalledWith(BUILT_ALERT, 'https://andeanscapes.com');
    expect(waitUntilMock).toHaveBeenCalledTimes(1);
  });

  it('logs a failed background dispatch instead of swallowing it', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const approvedPayment = { paymentId: '123', externalReference: REF, amount: 1, metadata: {}, isSandbox: true };
    getPaymentStatusMock.mockResolvedValue({ status: 'approved', approvedPayment });
    dispatchMock.mockRejectedValue(new Error('boom'));

    await GET(request(`ref=${REF}`));
    await waitUntilMock.mock.calls[0][0];

    expect(warn).toHaveBeenCalledWith('[PaymentAlert] dispatch failed: boom');
  });

  it('still answers 200 and logs when the alert cannot be built', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    getPaymentStatusMock.mockResolvedValue({
      status: 'approved',
      approvedPayment: { paymentId: '123', externalReference: REF, amount: 1, metadata: {}, isSandbox: true },
    });
    buildMock.mockRejectedValueOnce(new Error('no scope'));

    const response = await GET(request(`ref=${REF}`));

    expect(response.status).toBe(200);
    expect(warn).toHaveBeenCalledWith('[PaymentAlert] build failed: no scope');
    expect(dispatchMock).not.toHaveBeenCalled();
  });

  it('skips building when no alert channel is configured', async () => {
    hasChannelMock.mockReturnValue(false);
    getPaymentStatusMock.mockResolvedValue({
      status: 'approved',
      approvedPayment: { paymentId: '123', externalReference: REF, amount: 1, metadata: {}, isSandbox: true },
    });

    await GET(request(`ref=${REF}`));

    expect(buildMock).not.toHaveBeenCalled();
    expect(waitUntilMock).not.toHaveBeenCalled();
  });

  it('does not queue alerts for pending or rejected payments', async () => {
    getPaymentStatusMock.mockResolvedValue({ status: 'rejected', approvedPayment: null });

    await GET(request(`ref=${REF}`));

    expect(dispatchMock).not.toHaveBeenCalled();
    expect(waitUntilMock).not.toHaveBeenCalled();
  });

  it('rejects a reference that is not a UUID', async () => {
    const response = await GET(request('ref=nope'));
    expect(response.status).toBe(400);
    expect(getPaymentStatusMock).not.toHaveBeenCalled();
  });

  it('returns the status without caching and forwards a valid payment id', async () => {
    getPaymentStatusMock.mockResolvedValue({ status: 'approved', approvedPayment: null });

    const response = await GET(request(`ref=${REF}&payment_id=123`));

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    await expect(response.json()).resolves.toEqual({ status: 'approved' });
    expect(getPaymentStatusMock).toHaveBeenCalledWith(REF, '123');
  });

  it('drops a malformed payment id', async () => {
    getPaymentStatusMock.mockResolvedValue({ status: 'pending', approvedPayment: null });
    await GET(request(`ref=${REF}&payment_id=null`));
    expect(getPaymentStatusMock).toHaveBeenCalledWith(REF, undefined);
  });

  it('maps provider failures to 502 without leaking details', async () => {
    getPaymentStatusMock.mockRejectedValue(new PaymentError('provider_error', 'secret detail'));
    const response = await GET(request(`ref=${REF}`));
    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ code: 'provider_error' });
  });
});
