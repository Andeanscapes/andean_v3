import { NextRequest, NextResponse } from 'next/server';

/**
 * STUB – Mercado Pago payment endpoint.
 *
 * This file is intentionally NOT named `route.ts`, so Next.js App Router
 * will never mount it.  It exists only as a scaffold for future integration.
 *
 * Before activating (by renaming to route.ts):
 *   1. Remove wildcard CORS; restrict to deployment origin.
 *   2. Validate body with Zod (see src/lib/validation.ts).
 *   3. Remove hardcoded stub URL; call Mercado Pago API.
 *   4. Add rate-limiting (Cloudflare WAF / middleware).
 *
 * Security: gated behind ENABLE_PAYMENTS env flag.
 */

const PAYMENTS_ENABLED =
  typeof process !== 'undefined' &&
  process.env.ENABLE_PAYMENTS === 'true';

export async function POST(request: NextRequest) {
  if (!PAYMENTS_ENABLED) {
    return NextResponse.json(
      { error: 'Payments are not enabled' },
      { status: 503 },
    );
  }

  try {
    // TODO: Validate body with Zod and create real Mercado Pago link
    await request.json();
    // TODO: Store payment intent in DB

    const paymentLink =
      'https://www.mercadopago.com/checkout/stub-placeholder-emerald-mining';

    return NextResponse.json({ url: paymentLink }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create payment link' },
      { status: 500 },
    );
  }
}

export async function OPTIONS(_request: NextRequest) {
  if (!PAYMENTS_ENABLED) {
    return NextResponse.json(
      { error: 'Payments are not enabled' },
      { status: 503 },
    );
  }

  // TODO: Replace wildcard CORS with deployment origin
  return NextResponse.json(
    { message: 'OK' },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    },
  );
}
