import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => (key: string) => `T:${key}`),
}));

import { buildPaymentAlert, dispatchPaymentAlert, hasAlertChannel, type ApprovedPayment } from './payment-alert.service';

const REF = '3f2c1d4e-5a6b-4c7d-8e9f-0a1b2c3d4e5f';
const ORIGIN = 'https://andeanscapes.com';
const TELEGRAM_ENV = { TELEGRAM_BOT_TOKEN: 'bot-token', TELEGRAM_CHAT_ID: '12345' };
const RESEND_ENV = { RESEND_API_KEY: 're_test', ALERT_EMAIL_TO: 'ops@example.com', ALERT_EMAIL_FROM: 'reservas@example.com' };

function payment(overrides: Partial<ApprovedPayment> = {}): ApprovedPayment {
  return {
    paymentId: String(Math.floor(Math.random() * 1e12)),
    externalReference: REF,
    amount: 155000,
    isSandbox: true,
    metadata: {
      experience_id: 'chivorEmeraldCore',
      tier_id: 'heritage',
      date_id: 'nov-28-2026',
      people_count: 1,
      room_selections: [{ room_mode: 'standard_single', quantity: 1 }],
      transport_mode: 'car_no_4x4',
      total_amount: 620000,
      deposit_percent: 25,
      contact_name: 'Ana <b>Test</b>',
      contact_phone: '+57 300 000 0000',
      contact_email: '',
    },
    ...overrides,
  };
}

function stubFetch(status = 200) {
  const mock = vi.fn(async (_input: string | URL, _init?: RequestInit) => ({ ok: status < 400, status }));
  vi.stubGlobal('fetch', mock);
  return mock;
}

async function dispatch(approved: ApprovedPayment, origin: string, env: Record<string, string>) {
  await dispatchPaymentAlert(await buildPaymentAlert(approved), origin, env);
}

function calledUrls(mock: ReturnType<typeof stubFetch>): string[] {
  return mock.mock.calls.map(([input]) => String(input));
}

describe('buildPaymentAlert', () => {
  it('builds the booking lines with the operation number and reference', async () => {
    const alert = await buildPaymentAlert(payment({ paymentId: '187832699960' }));

    expect(alert.title).toBe('Depósito recibido — Web');
    expect(alert.isSandbox).toBe(true);
    expect(alert.lines).toContainEqual({ label: 'Operación Mercado Pago', value: '#187832699960' });
    expect(alert.lines).toContainEqual({ label: 'Referencia', value: REF });
    expect(alert.lines).toContainEqual({ label: 'Habitaciones', value: '1× standard_single' });
    expect(alert.lines).toContainEqual({ label: 'Experiencia', value: 'T:experiences.chivorEmeraldCore.title' });
  });

  it('adds a warning when the paid amount differs from the expected deposit', async () => {
    const alert = await buildPaymentAlert(payment({ amount: 1000 }));
    expect(alert.lines.some((line) => 'warning' in line)).toBe(true);
  });

  it('keeps the valid fields when one metadata field is malformed', async () => {
    const approved = payment();
    const alert = await buildPaymentAlert({
      ...approved,
      metadata: { ...(approved.metadata as Record<string, unknown>), tier_id: 42, room_selections: 'bad' },
    });
    expect(alert.lines).toContainEqual({ label: 'Cliente', value: 'Ana <b>Test</b>' });
    expect(alert.lines).toContainEqual({ label: 'Alojamiento', value: '—' });
  });

  it('still builds when metadata is missing', async () => {
    const alert = await buildPaymentAlert(payment({ metadata: undefined }));
    expect(alert.lines).toContainEqual({ label: 'Cliente', value: '—' });
  });
});

describe('dispatchPaymentAlert', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('sends to both configured channels once per payment', async () => {
    const mock = stubFetch();
    const approved = payment();
    const env = { ...TELEGRAM_ENV, ...RESEND_ENV };

    await dispatch(approved, ORIGIN, env);
    await dispatch(approved, ORIGIN, env);

    const urls = calledUrls(mock);
    expect(urls.filter((url) => url.startsWith('https://api.telegram.org/'))).toHaveLength(1);
    expect(urls.filter((url) => url === 'https://api.resend.com/emails')).toHaveLength(1);
  });

  it('keeps the other channel when one fails', async () => {
    const mock = vi.fn(async (input: string | URL, _init?: RequestInit) => ({
      ok: !String(input).startsWith('https://api.telegram.org/'),
      status: String(input).startsWith('https://api.telegram.org/') ? 500 : 200,
    }));
    vi.stubGlobal('fetch', mock);

    await dispatch(payment(), ORIGIN, { ...TELEGRAM_ENV, ...RESEND_ENV });

    expect(calledUrls(mock)).toContain('https://api.resend.com/emails');
  });

  it('retries a transient failure on a later check', async () => {
    const approved = payment();
    stubFetch(500);
    await dispatch(approved, ORIGIN, TELEGRAM_ENV);

    const retry = stubFetch(200);
    await dispatch(approved, ORIGIN, TELEGRAM_ENV);
    expect(calledUrls(retry)).toHaveLength(1);
  });

  it('does not retry a rejection that a retry cannot fix', async () => {
    const approved = payment();
    stubFetch(400);
    await dispatch(approved, ORIGIN, TELEGRAM_ENV);

    const later = stubFetch(200);
    await dispatch(approved, ORIGIN, TELEGRAM_ENV);
    expect(calledUrls(later)).toHaveLength(0);
  });

  it('does nothing and does not throw when no channel is configured', async () => {
    const mock = stubFetch();
    await expect(dispatch(payment(), ORIGIN, {})).resolves.toBeUndefined();
    expect(mock).not.toHaveBeenCalled();
  });

  it('warns about a missing channel only once per isolate', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(hasAlertChannel({})).toBe(false);
    expect(hasAlertChannel({})).toBe(false);
    expect(hasAlertChannel(TELEGRAM_ENV)).toBe(true);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});
