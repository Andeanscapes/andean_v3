import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => (key: string) => key),
}));


import {
  createCheckoutLink,
  getPaymentStatus,
  resolveMercadoPagoConfig,
  type PaymentErrorCode,
} from './mercadopago.service';
import { CheckoutRequestSchema, type CheckoutRequest } from '../schemas/payment.schema';
import { EXPERIENCE_FIXTURE, cloneFixture } from '@/test/fixtures';

const SANDBOX_TOKEN = 'TEST-sandbox-token';
const LIVE_TOKEN = 'APP_USR-live-token';
const TEST_USER_TOKEN = 'APP_USR-test-user-token';
const SANDBOX_URL = 'https://sandbox.mercadopago.com.co/checkout/v1/redirect?pref_id=1';
const LIVE_URL = 'https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=1';
const ORIGIN = 'https://andeanscapes.com';

function firstDateId(): string {
  return EXPERIENCE_FIXTURE.availableDates[0].id;
}

function baseRequest(overrides: Partial<CheckoutRequest> = {}): CheckoutRequest {
  return {
    experienceId: 'chivorEmeraldCore',
    locale: 'es',
    selectedTierId: 'heritage',
    selectedDateId: firstDateId(),
    roomSelections: [{ roomMode: 'standard_single', quantity: 1 }],
    transportMode: 'car_no_4x4',
    contact: { name: 'Ana Test', phone: '+57 300 000 0000', email: '' },
    termsAccepted: true,
    ...overrides,
  };
}

function stubFetch(
  preference: Record<string, unknown> = { id: 'pref-1', init_point: LIVE_URL, sandbox_init_point: SANDBOX_URL },
  accountTags: string[] = ['normal'],
) {
  const mock = vi.fn(async (input: string | URL, _init?: RequestInit) => {
    if (String(input) === 'https://api.mercadopago.com/users/me') {
      return { ok: true, status: 200, json: async () => ({ id: 1, tags: accountTags }) };
    }
    if (String(input).startsWith('https://api.mercadopago.com/')) {
      return { ok: true, status: 201, json: async () => preference };
    }
    return { ok: true, json: async () => cloneFixture(EXPERIENCE_FIXTURE) };
  });
  vi.stubGlobal('fetch', mock);
  return mock;
}

function preferenceBody(mock: ReturnType<typeof stubFetch>) {
  const call = mock.mock.calls.find(([input]) => String(input).startsWith('https://api.mercadopago.com/checkout/'));
  const init = call?.[1] as RequestInit | undefined;
  return { body: JSON.parse(String(init?.body)), headers: init?.headers as Record<string, string> };
}

async function expectCode(promise: Promise<unknown>, code: PaymentErrorCode) {
  await expect(promise).rejects.toMatchObject({ name: 'PaymentError', code });
}

describe('resolveMercadoPagoConfig', () => {
  it('fails closed without a token', () => {
    expect(() => resolveMercadoPagoConfig({})).toThrow(/not set/);
  });

  it('defaults to sandbox', () => {
    expect(resolveMercadoPagoConfig({ MERCADOPAGO_ACCESS_TOKEN: SANDBOX_TOKEN }).mode).toBe('sandbox');
  });

  it('rejects a test token in production', () => {
    expect(() =>
      resolveMercadoPagoConfig({ MERCADOPAGO_ACCESS_TOKEN: SANDBOX_TOKEN, MERCADOPAGO_MODE: 'production' }),
    ).toThrow(/does not match/);
    expect(
      resolveMercadoPagoConfig({ MERCADOPAGO_ACCESS_TOKEN: LIVE_TOKEN, MERCADOPAGO_MODE: 'production' }).mode,
    ).toBe('production');
  });
});

describe('CheckoutRequestSchema', () => {
  it('rejects a client-supplied amount', () => {
    expect(CheckoutRequestSchema.safeParse({ ...baseRequest(), depositAmount: 1 }).success).toBe(false);
  });
});

describe('createCheckoutLink', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-01T12:00:00.000Z'));
    process.env.REMOTE_DATA_BASE_URL = 'https://cdn.example.com/services';
    process.env.MERCADOPAGO_ACCESS_TOKEN = SANDBOX_TOKEN;
    delete process.env.MERCADOPAGO_MODE;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    delete process.env.REMOTE_DATA_BASE_URL;
    delete process.env.MERCADOPAGO_ACCESS_TOKEN;
    delete process.env.MERCADOPAGO_MODE;
  });

  it('prices the deposit on the server and returns the sandbox URL', async () => {
    const mock = stubFetch();

    const checkout = await createCheckoutLink(baseRequest(), ORIGIN);
    expect(checkout.url).toBe(SANDBOX_URL);

    const { body, headers } = preferenceBody(mock);
    expect(checkout.reference).toBe(body.external_reference);
    const { basePerPerson, depositPercent } = EXPERIENCE_FIXTURE.experience.pricing;
    const single = EXPERIENCE_FIXTURE.roomModes.find((mode) => mode.value === 'standard_single');
    const total = Math.round(basePerPerson * (single?.priceMultiplier ?? 1));
    expect(body.items[0]).toMatchObject({ currency_id: 'COP', quantity: 1, unit_price: Math.round(total * (depositPercent / 100)) });
    expect(body.auto_return).toBe('approved');
    expect(body.back_urls.success).toBe(
      `${ORIGIN}/es/experiences/${EXPERIENCE_FIXTURE.experience.slug}/booking?ref=${body.external_reference}`,
    );
    expect(headers.Authorization).toBe(`Bearer ${SANDBOX_TOKEN}`);
  });

  it('omits auto_return for a non-HTTPS origin (local dev)', async () => {
    const mock = stubFetch();

    await createCheckoutLink(baseRequest(), 'http://localhost:3000');

    const { body } = preferenceBody(mock);
    expect(body.auto_return).toBeUndefined();
    expect(body.back_urls.success).toMatch(/^http:\/\/localhost:3000\/es\/experiences\//);
  });

  it('accepts a test-user account in sandbox and uses its regular checkout URL', async () => {
    process.env.MERCADOPAGO_ACCESS_TOKEN = TEST_USER_TOKEN;
    stubFetch(undefined, ['test_user', 'normal']);

    await expect(createCheckoutLink(baseRequest(), ORIGIN)).resolves.toMatchObject({ url: LIVE_URL });
  });

  it('refuses a real account in sandbox before creating a preference', async () => {
    process.env.MERCADOPAGO_ACCESS_TOKEN = 'APP_USR-real-account-in-dev';
    const mock = stubFetch(undefined, ['normal']);

    await expectCode(createCheckoutLink(baseRequest(), ORIGIN), 'not_configured');
    expect(mock.mock.calls.some(([input]) => String(input).includes('/checkout/'))).toBe(false);
  });

  it('refuses a test-user account in production', async () => {
    process.env.MERCADOPAGO_ACCESS_TOKEN = 'APP_USR-test-user-in-prod';
    process.env.MERCADOPAGO_MODE = 'production';
    stubFetch(undefined, ['test_user']);

    await expectCode(createCheckoutLink(baseRequest(), ORIGIN), 'not_configured');
  });

  it('sends the payer email only in production', async () => {
    const withEmail = baseRequest({ contact: { name: 'Ana Test', phone: '+57 300 000 0000', email: 'ana@example.com' } });

    const sandbox = stubFetch();
    await createCheckoutLink(withEmail, ORIGIN);
    expect(preferenceBody(sandbox).body.payer).toEqual({ name: 'Ana Test' });
    expect(preferenceBody(sandbox).body.metadata.contact_email).toBe('ana@example.com');

    process.env.MERCADOPAGO_ACCESS_TOKEN = LIVE_TOKEN;
    process.env.MERCADOPAGO_MODE = 'production';
    const production = stubFetch();
    await createCheckoutLink(withEmail, ORIGIN);
    expect(preferenceBody(production).body.payer).toEqual({ name: 'Ana Test', email: 'ana@example.com' });
  });

  it('returns the live URL in production mode', async () => {
    process.env.MERCADOPAGO_ACCESS_TOKEN = LIVE_TOKEN;
    process.env.MERCADOPAGO_MODE = 'production';
    stubFetch();

    await expect(createCheckoutLink(baseRequest(), ORIGIN)).resolves.toMatchObject({ url: LIVE_URL });
  });

  it('adds the round-trip transfer to the deposit base', async () => {
    const mock = stubFetch();

    await createCheckoutLink(baseRequest({ transportMode: 'roundtrip_transfer' }), ORIGIN);

    const { body } = preferenceBody(mock);
    expect(body.metadata.total_amount).toBeGreaterThan(EXPERIENCE_FIXTURE.experience.pricing.basePerPerson);
    expect(body.items[0].unit_price).toBe(
      Math.round(body.metadata.total_amount * (EXPERIENCE_FIXTURE.experience.pricing.depositPercent / 100)),
    );
  });

  it('rejects a date the feed does not offer', async () => {
    stubFetch();
    await expectCode(createCheckoutLink(baseRequest({ selectedDateId: 'jan-01-2099' }), ORIGIN), 'unavailable');
  });

  it('rejects more rooms than are available', async () => {
    stubFetch();
    await expectCode(
      createCheckoutLink(baseRequest({ roomSelections: [{ roomMode: 'family_3', quantity: 2 }] }), ORIGIN),
      'unavailable',
    );
  });

  it('rejects an unknown tier', async () => {
    stubFetch();
    await expectCode(createCheckoutLink(baseRequest({ selectedTierId: 'nope' }), ORIGIN), 'invalid_request');
  });

  it('rejects a checkout URL outside Mercado Pago', async () => {
    stubFetch({ id: 'pref-1', init_point: LIVE_URL, sandbox_init_point: 'https://evil.example.com/pay' });
    await expectCode(createCheckoutLink(baseRequest(), ORIGIN), 'provider_error');
  });

  it('does not call Mercado Pago when the token is missing', async () => {
    delete process.env.MERCADOPAGO_ACCESS_TOKEN;
    const mock = stubFetch();

    await expectCode(createCheckoutLink(baseRequest(), ORIGIN), 'not_configured');
    expect(mock).not.toHaveBeenCalled();
  });
});

describe('getPaymentStatus', () => {
  const REF = '3f2c1d4e-5a6b-4c7d-8e9f-0a1b2c3d4e5f';

  beforeEach(() => {
    process.env.MERCADOPAGO_ACCESS_TOKEN = SANDBOX_TOKEN;
    delete process.env.MERCADOPAGO_MODE;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.MERCADOPAGO_ACCESS_TOKEN;
  });

  function searchReturns(results: unknown[], ok = true) {
    const mock = vi.fn(async (_input: string | URL, _init?: RequestInit) => ({
      ok,
      status: ok ? 200 : 500,
      json: async () => ({ results }),
    }));
    vi.stubGlobal('fetch', mock);
    return mock;
  }

  it('maps the latest approved payment to approved', async () => {
    const mock = searchReturns([{ status: 'approved' }]);
    await expect(getPaymentStatus(REF)).resolves.toMatchObject({ status: 'approved' });
    const url = String(mock.mock.calls[0][0]);
    expect(url).toContain(`external_reference=${REF}`);
    expect(url).toContain('sort=date_created');
  });

  it('returns the approved payment for alerting only when approved', async () => {
    searchReturns([{ id: 987, status: 'approved', transaction_amount: 155000, metadata: { contact_name: 'Ana' } }]);
    await expect(getPaymentStatus(REF)).resolves.toMatchObject({
      status: 'approved',
      approvedPayment: { paymentId: '987', externalReference: REF, amount: 155000, isSandbox: true },
    });

    searchReturns([{ id: 988, status: 'in_process' }]);
    await expect(getPaymentStatus(REF)).resolves.toMatchObject({ status: 'pending', approvedPayment: null });
  });

  it('maps pending states (PSE, cash) to pending', async () => {
    searchReturns([{ status: 'in_process' }]);
    await expect(getPaymentStatus(REF)).resolves.toMatchObject({ status: 'pending' });
  });

  it('maps cancelled and rejected payments to rejected', async () => {
    searchReturns([{ status: 'rejected' }]);
    await expect(getPaymentStatus(REF)).resolves.toMatchObject({ status: 'rejected' });
    searchReturns([{ status: 'cancelled' }]);
    await expect(getPaymentStatus(REF)).resolves.toMatchObject({ status: 'rejected' });
  });

  it('returns not_found when no payment exists for the reference', async () => {
    searchReturns([]);
    await expect(getPaymentStatus(REF)).resolves.toMatchObject({ status: 'not_found' });
  });

  it('uses the direct payment lookup when the payment belongs to our reference', async () => {
    const mock = vi.fn(async (input: string | URL, _init?: RequestInit) => ({
      ok: true,
      status: 200,
      json: async () =>
        String(input).includes('/v1/payments/123')
          ? { status: 'approved', external_reference: REF }
          : { results: [] },
    }));
    vi.stubGlobal('fetch', mock);

    await expect(getPaymentStatus(REF, '123')).resolves.toMatchObject({ status: 'approved' });
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it('ignores a payment id from another reference and falls back to search', async () => {
    const mock = vi.fn(async (input: string | URL, _init?: RequestInit) => ({
      ok: true,
      status: 200,
      json: async () =>
        String(input).includes('/v1/payments/123')
          ? { status: 'approved', external_reference: 'someone-else' }
          : { results: [] },
    }));
    vi.stubGlobal('fetch', mock);

    await expect(getPaymentStatus(REF, '123')).resolves.toMatchObject({ status: 'not_found' });
    expect(String(mock.mock.calls[1][0])).toContain('/v1/payments/search');
  });

  it('throws provider_error when Mercado Pago fails', async () => {
    searchReturns([], false);
    await expectCode(getPaymentStatus(REF), 'provider_error');
  });
});
