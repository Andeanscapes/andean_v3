import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderTelegramAlert, sendTelegramPaymentAlert } from './telegram.service';
import type { PaymentAlert } from './payment-alert.service';

const ENV = { TELEGRAM_BOT_TOKEN: 'bot-token', TELEGRAM_CHAT_ID: '12345' };

function alert(overrides: Partial<PaymentAlert> = {}): PaymentAlert {
  return {
    title: 'Depósito recibido — Web',
    isSandbox: true,
    paymentId: '187832699960',
    externalReference: 'ref',
    lines: [
      { label: 'Cliente', value: 'Ana <b>Test</b> & co' },
      { warning: 'El monto pagado no coincide.' },
    ],
    ...overrides,
  };
}

describe('renderTelegramAlert', () => {
  it('renders HTML with escaped customer values and the sandbox marker', () => {
    const html = renderTelegramAlert(alert());
    expect(html).toContain('<b>Depósito recibido — Web</b>');
    expect(html).toContain('SANDBOX');
    expect(html).toContain('Ana &lt;b&gt;Test&lt;/b&gt; &amp; co');
    expect(html).toContain('⚠️ <b>El monto pagado no coincide.</b>');
  });
});

describe('sendTelegramPaymentAlert', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('posts to the bridge chat and reports sent', async () => {
    const mock = vi.fn(async (_input: string | URL, _init?: RequestInit) => ({ ok: true, status: 200 }));
    vi.stubGlobal('fetch', mock);

    await expect(sendTelegramPaymentAlert(alert(), ENV)).resolves.toBe('sent');

    expect(String(mock.mock.calls[0][0])).toBe('https://api.telegram.org/botbot-token/sendMessage');
    expect(JSON.parse(String(mock.mock.calls[0][1]?.body))).toMatchObject({ chat_id: '12345', parse_mode: 'HTML' });
  });

  it('reports retry for rate limits and network errors, rejected for other errors', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 429 })));
    await expect(sendTelegramPaymentAlert(alert(), ENV)).resolves.toBe('retry');

    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 400 })));
    await expect(sendTelegramPaymentAlert(alert(), ENV)).resolves.toBe('rejected');

    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    await expect(sendTelegramPaymentAlert(alert(), ENV)).resolves.toBe('retry');
  });
});
