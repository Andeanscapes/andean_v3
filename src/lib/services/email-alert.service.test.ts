import { afterEach, describe, expect, it, vi } from 'vitest';
import { isEmailConfigured, renderEmailAlert, sendEmailPaymentAlert } from './email-alert.service';
import type { PaymentAlert } from './payment-alert.service';

const ENV = { RESEND_API_KEY: 're_test', ALERT_EMAIL_TO: 'ops@example.com', ALERT_EMAIL_FROM: 'reservas@example.com' };

function alert(overrides: Partial<PaymentAlert> = {}): PaymentAlert {
  return {
    title: 'Depósito recibido — Web',
    isSandbox: false,
    paymentId: '187832699960',
    externalReference: 'ref-1',
    lines: [
      { label: 'Cliente', value: 'Ana <b>Test</b>' },
      { warning: 'El monto pagado no coincide.' },
    ],
    ...overrides,
  };
}

describe('isEmailConfigured', () => {
  it('needs the key, the recipient and the sender', () => {
    expect(isEmailConfigured(ENV)).toBe(true);
    expect(isEmailConfigured({ ...ENV, ALERT_EMAIL_FROM: '' })).toBe(false);
    expect(isEmailConfigured({})).toBe(false);
  });
});

describe('renderEmailAlert', () => {
  it('builds a plain-text body with the payment number in the subject', () => {
    const { subject, text } = renderEmailAlert(alert());
    expect(subject).toBe('Depósito recibido — Web · #187832699960');
    expect(text).toContain('Cliente: Ana <b>Test</b>');
    expect(text).toContain('⚠️ El monto pagado no coincide.');
    expect(text).not.toContain('SANDBOX');
  });

  it('marks sandbox payments in the subject and the body', () => {
    const { subject, text } = renderEmailAlert(alert({ isSandbox: true }));
    expect(subject.startsWith('[SANDBOX] ')).toBe(true);
    expect(text.startsWith('SANDBOX')).toBe(true);
  });
});

describe('sendEmailPaymentAlert', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('sends through Resend with an idempotency key per payment', async () => {
    const mock = vi.fn(async (_input: string | URL, _init?: RequestInit) => ({ ok: true, status: 200 }));
    vi.stubGlobal('fetch', mock);

    await expect(sendEmailPaymentAlert(alert(), ENV)).resolves.toBe('sent');

    const [url, init] = mock.mock.calls[0];
    expect(String(url)).toBe('https://api.resend.com/emails');
    expect(init?.headers).toMatchObject({
      Authorization: 'Bearer re_test',
      'Idempotency-Key': 'payment-alert-187832699960',
    });
    expect(JSON.parse(String(init?.body))).toMatchObject({
      from: 'reservas@example.com',
      to: ['ops@example.com'],
    });
  });

  it('reports rejected without calling Resend when not configured', async () => {
    const mock = vi.fn();
    vi.stubGlobal('fetch', mock);
    await expect(sendEmailPaymentAlert(alert(), {})).resolves.toBe('rejected');
    expect(mock).not.toHaveBeenCalled();
  });

  it('reports retry for server errors and rejected for an unverified sender', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 503 })));
    await expect(sendEmailPaymentAlert(alert(), ENV)).resolves.toBe('retry');

    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 403 })));
    await expect(sendEmailPaymentAlert(alert(), ENV)).resolves.toBe('rejected');
  });
});
