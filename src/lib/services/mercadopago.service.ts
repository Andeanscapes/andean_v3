/**
 * Mercado Pago Checkout Pro — server only.
 *
 * Interim home for payments until `andean-scapes-payments` (Lambda) exists; the
 * route only calls `createCheckoutLink`, so the move is a single swap.
 *
 * Never import this from a client component: it reads the access token.
 *
 * Environment (runtime, never `NEXT_PUBLIC_*`):
 * - `MERCADOPAGO_ACCESS_TOKEN` secret. Local: `.env.local`. Deployed:
 *   `wrangler secret put MERCADOPAGO_ACCESS_TOKEN [--env dev]`.
 * - `MERCADOPAGO_MODE` `production` | `sandbox`. Anything else is sandbox, so
 *   an unconfigured environment can never charge a real card.
 *
 * The token's account must match the mode: sandbox needs test credentials
 * (`TEST-` token or a Mercado Pago test-user account), production needs a real
 * account. A production token in dev or a test token in prod fails closed.
 */

import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import type { ExperienceData, RoomSelection } from '../schemas';
import type { CheckoutRequest, CheckoutResponse } from '../schemas/payment.schema';
import { getBookingPricingData } from './book.service';
import type { ApprovedPayment } from './payment-alert.types';
import { calculatePricing, computePeopleCount } from '@/utils/helpers';
import { buildReservationSchema } from '@/utils/validationSchemas';
import { buildExperiencePath, sanitizeLocale } from '@/utils/seoUrls';

const API_BASE_URL = 'https://api.mercadopago.com';
const REQUEST_TIMEOUT_MS = 8000;
const TEST_TOKEN_PREFIX = 'TEST-';
const CHECKOUT_HOST = /(^|\.)mercadopago\.com(\.[a-z]{2})?$/;

export type PaymentErrorCode = 'invalid_request' | 'unavailable' | 'not_configured' | 'provider_error';

export class PaymentError extends Error {
  constructor(public readonly code: PaymentErrorCode, message: string) {
    super(message);
    this.name = 'PaymentError';
  }
}

export type MercadoPagoMode = 'production' | 'sandbox';

interface MercadoPagoConfig {
  accessToken: string;
  mode: MercadoPagoMode;
}

export function resolveMercadoPagoConfig(
  env: Record<string, string | undefined> = process.env,
): MercadoPagoConfig {
  const accessToken = env.MERCADOPAGO_ACCESS_TOKEN?.trim() ?? '';
  const mode: MercadoPagoMode = env.MERCADOPAGO_MODE === 'production' ? 'production' : 'sandbox';

  if (!accessToken) {
    throw new PaymentError('not_configured', 'MERCADOPAGO_ACCESS_TOKEN is not set');
  }
  if (mode === 'production' && accessToken.startsWith(TEST_TOKEN_PREFIX)) {
    throw new PaymentError('not_configured', 'Access token does not match MERCADOPAGO_MODE=production');
  }

  return { accessToken, mode };
}

const accountSchema = z.object({ tags: z.array(z.string()).default([]) });
/** Per-isolate cache: an account's test status never changes for a given token. */
const testAccountCache = new Map<string, boolean>();

/**
 * Whether the token belongs to test credentials. Current Mercado Pago test
 * users get `APP_USR-` tokens, so the prefix alone cannot tell; their account
 * carries the `test_user` tag instead.
 */
async function isTestAccount(accessToken: string): Promise<boolean> {
  if (accessToken.startsWith(TEST_TOKEN_PREFIX)) return true;
  const cached = testAccountCache.get(accessToken);
  if (cached !== undefined) return cached;

  const parsed = accountSchema.safeParse(await mercadoPagoFetch('/users/me', accessToken));
  if (!parsed.success) {
    throw new PaymentError('provider_error', 'Account response was invalid');
  }
  const isTest = parsed.data.tags.includes('test_user');
  testAccountCache.set(accessToken, isTest);
  return isTest;
}

async function assertAccountMatchesMode({ accessToken, mode }: MercadoPagoConfig): Promise<void> {
  if ((await isTestAccount(accessToken)) !== (mode === 'sandbox')) {
    throw new PaymentError('not_configured', `Access token account does not match MERCADOPAGO_MODE=${mode}`);
  }
}

export interface CheckoutQuote {
  tierId: string | null;
  dateId: string;
  peopleCount: number;
  roomSelections: RoomSelection[];
  total: number;
  depositPercent: number;
  depositAmount: number;
}

/**
 * Re-price a request from the feed with the same functions the booking UI
 * uses, so the charged deposit always equals the one the customer saw.
 */
export function quoteCheckout(data: ExperienceData, request: CheckoutRequest): CheckoutQuote {
  const { config, roomModes, availableDates, transportOptions } = data;
  const tiers = data.accommodationTiers ?? [];

  const tier = request.selectedTierId
    ? tiers.find((candidate) => candidate.id === request.selectedTierId)
    : undefined;
  if (request.selectedTierId ? !tier : tiers.length > 0) {
    throw new PaymentError('invalid_request', 'Unknown or missing tier');
  }
  const tierId = tier?.id ?? null;

  const unitsByMode = new Map<string, number>();
  for (const selection of request.roomSelections) {
    unitsByMode.set(selection.roomMode, (unitsByMode.get(selection.roomMode) ?? 0) + selection.quantity);
  }
  for (const [value, units] of Array.from(unitsByMode)) {
    const mode = roomModes.find((candidate) => candidate.value === value);
    if (!mode || (tierId && mode.tier_id && mode.tier_id !== tierId)) {
      throw new PaymentError('invalid_request', 'Room mode not offered for this tier');
    }
    if (units > mode.units_available) {
      throw new PaymentError('unavailable', 'Not enough rooms available');
    }
  }

  if (!transportOptions.some((option) => option.value === request.transportMode)) {
    throw new PaymentError('invalid_request', 'Transport mode not offered');
  }
  const roundtripConfig = tier?.roundtripTransfer ?? null;
  if (request.transportMode === 'roundtrip_transfer' && !roundtripConfig) {
    throw new PaymentError('invalid_request', 'Round-trip transfer not offered for this tier');
  }

  const peopleCount = computePeopleCount(request.roomSelections, roomModes);
  const parsed = buildReservationSchema({ minPeople: config.minPeople, maxPeople: config.maxPeople }).safeParse({
    selectedDateId: request.selectedDateId,
    peopleCount,
    roomSelections: request.roomSelections,
    transportMode: request.transportMode,
    contact: request.contact,
    termsAccepted: request.termsAccepted,
  });
  if (!parsed.success) {
    throw new PaymentError('invalid_request', 'Reservation failed validation');
  }

  const date = availableDates.find((candidate) => candidate.id === request.selectedDateId);
  if (!date || !date.isAvailable || date.spots < peopleCount) {
    throw new PaymentError('unavailable', 'Date is no longer available');
  }

  const pricing = calculatePricing(
    config.experiencePricePerPerson,
    config.depositPercent,
    roomModes,
    request.roomSelections,
    request.transportMode,
    roundtripConfig,
  );
  if (!Number.isInteger(pricing.depositAmount) || pricing.depositAmount <= 0) {
    throw new PaymentError('invalid_request', 'Deposit must be a positive amount');
  }

  return {
    tierId,
    dateId: date.id,
    peopleCount,
    roomSelections: request.roomSelections,
    total: pricing.total,
    depositPercent: pricing.depositPercent,
    depositAmount: pricing.depositAmount,
  };
}

interface PreferenceResponse {
  init_point: string;
  sandbox_init_point?: string;
}

function isPreferenceResponse(value: unknown): value is PreferenceResponse {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.init_point === 'string' &&
    (record.sandbox_init_point === undefined || typeof record.sandbox_init_point === 'string')
  );
}

function toCheckoutUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && CHECKOUT_HOST.test(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Authenticated call to the Mercado Pago API with a timeout. Returns the parsed
 * JSON body; any network, HTTP or JSON failure becomes `provider_error`.
 */
async function mercadoPagoFetch(
  path: string,
  accessToken: string,
  init: { method?: 'GET' | 'POST'; headers?: Record<string, string>; body?: string } = {},
): Promise<unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new PaymentError('provider_error', `${path.split('?')[0]} rejected (${response.status})`);
    }
    return await response.json();
  } catch (err) {
    if (err instanceof PaymentError) throw err;
    throw new PaymentError('provider_error', `${path.split('?')[0]} request failed`);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Create a Checkout Pro preference and return its checkout URL and our reference.
 * `origin` is the site origin the customer returns to after paying.
 */
export async function createCheckoutLink(request: CheckoutRequest, origin: string): Promise<CheckoutResponse> {
  const mpConfig = resolveMercadoPagoConfig();
  await assertAccountMatchesMode(mpConfig);
  const locale = sanitizeLocale(request.locale);

  const [{ data, slug }, t] = await Promise.all([
    getBookingPricingData(request.experienceId),
    getTranslations({ locale }),
  ]);

  if (data.config.currency !== 'COP') {
    throw new PaymentError('not_configured', `Unsupported currency ${data.config.currency}`);
  }

  const quote = quoteCheckout(data, request);
  const externalReference = globalThis.crypto.randomUUID();
  const returnUrl = `${origin}${buildExperiencePath(locale, slug, '/booking')}?ref=${externalReference}`;
  const email = request.contact.email.trim();

  const payload = await mercadoPagoFetch('/checkout/preferences', mpConfig.accessToken, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Idempotency-Key': externalReference,
    },
    body: JSON.stringify({
      items: [
        {
          id: request.experienceId,
          // `config.title` is an i18n key from the typed experience mapping, not feed text.
          title: `${t('experiences.ui.depositLabel')} · ${t(data.config.title)}`,
          quantity: 1,
          currency_id: 'COP',
          unit_price: quote.depositAmount,
        },
      ],
      // In sandbox a real payer email links the buyer to a real Mercado Pago
      // account, which Mercado Pago rejects against a test seller
      // ("una de las partes ... es de prueba"). It stays in metadata.
      payer: {
        name: request.contact.name,
        ...(email && mpConfig.mode === 'production' ? { email } : {}),
      },
      external_reference: externalReference,
      back_urls: { success: returnUrl, pending: returnUrl, failure: returnUrl },
      // Mercado Pago rejects auto_return for non-HTTPS return URLs (local dev).
      ...(returnUrl.startsWith('https://') ? { auto_return: 'approved' } : {}),
      metadata: {
        experience_id: request.experienceId,
        locale,
        tier_id: quote.tierId,
        date_id: quote.dateId,
        people_count: quote.peopleCount,
        room_selections: quote.roomSelections,
        transport_mode: request.transportMode,
        total_amount: quote.total,
        deposit_percent: quote.depositPercent,
        contact_name: request.contact.name,
        contact_phone: request.contact.phone,
        contact_email: email,
      },
    }),
  });

  if (!isPreferenceResponse(payload)) {
    throw new PaymentError('provider_error', 'Preference response was invalid');
  }

  // `sandbox_init_point` only serves legacy `TEST-` credentials; test-user
  // accounts check out on the regular `init_point` with test cards.
  const useSandboxUrl = mpConfig.accessToken.startsWith(TEST_TOKEN_PREFIX);
  const url = toCheckoutUrl(useSandboxUrl ? payload.sandbox_init_point : payload.init_point);
  if (!url) {
    throw new PaymentError('provider_error', 'Preference response had no usable checkout URL');
  }

  console.info(`[MercadoPago] preference created mode=${mpConfig.mode} ref=${externalReference}`);
  return { url, reference: externalReference };
}

export type PaymentStatus = 'approved' | 'pending' | 'rejected' | 'not_found';

const paymentSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  status: z.string(),
  external_reference: z.string().nullable().optional(),
  transaction_amount: z.number().nullable().optional(),
  metadata: z.unknown().optional(),
});
const searchResponseSchema = z.object({ results: z.array(paymentSchema) });

/** Maps Mercado Pago payment states onto the outcomes the booking page shows. */
export function toPaymentStatus(mpStatus: string): Exclude<PaymentStatus, 'not_found'> {
  if (mpStatus === 'approved') return 'approved';
  if (['rejected', 'cancelled', 'refunded', 'charged_back'].includes(mpStatus)) return 'rejected';
  return 'pending';
}

/**
 * Direct lookup by the `payment_id` Mercado Pago appends to the return URL.
 * Unlike search, it is consistent immediately after payment. The payment must
 * belong to our reference, otherwise a foreign id could be replayed.
 */
async function findPaymentById(paymentId: string, externalReference: string, accessToken: string) {
  try {
    const parsed = paymentSchema.safeParse(
      await mercadoPagoFetch(`/v1/payments/${encodeURIComponent(paymentId)}`, accessToken),
    );
    return parsed.success && parsed.data.external_reference === externalReference ? parsed.data : null;
  } catch {
    // Unknown or foreign id: fall back to the reference search below.
    return null;
  }
}

async function findLatestPaymentByReference(externalReference: string, accessToken: string) {
  const query = new URLSearchParams({
    external_reference: externalReference,
    sort: 'date_created',
    criteria: 'desc',
    limit: '1',
  });
  const parsed = searchResponseSchema.safeParse(
    await mercadoPagoFetch(`/v1/payments/search?${query.toString()}`, accessToken),
  );
  if (!parsed.success) {
    throw new PaymentError('provider_error', 'Payment search response was invalid');
  }
  return parsed.data.results[0] ?? null;
}

export interface PaymentLookup {
  status: PaymentStatus;
  /** Set only when approved: the caller alerts the operator from it, outside the request. */
  approvedPayment: ApprovedPayment | null;
}

/**
 * Status of a payment for one of our references, asked of Mercado Pago
 * directly so the browser's return URL is never trusted.
 */
export async function getPaymentStatus(externalReference: string, paymentId?: string): Promise<PaymentLookup> {
  const { accessToken, mode } = resolveMercadoPagoConfig();
  const payment =
    (paymentId ? await findPaymentById(paymentId, externalReference, accessToken) : null) ??
    (await findLatestPaymentByReference(externalReference, accessToken));
  if (!payment) return { status: 'not_found', approvedPayment: null };

  const status = toPaymentStatus(payment.status);
  const approvedPayment: ApprovedPayment | null =
    status === 'approved' && payment.id !== undefined
      ? {
          paymentId: String(payment.id),
          externalReference,
          amount: payment.transaction_amount ?? null,
          metadata: payment.metadata,
          isSandbox: mode === 'sandbox',
        }
      : null;
  return { status, approvedPayment };
}
