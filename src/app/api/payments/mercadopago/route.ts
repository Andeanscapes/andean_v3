import { NextRequest, NextResponse } from 'next/server';
import { CheckoutRequestSchema } from '@/lib/schemas/payment.schema';
import { createCheckoutLink, PaymentError, type PaymentErrorCode } from '@/lib/services/mercadopago.service';

const STATUS_BY_CODE: Record<PaymentErrorCode, number> = {
  invalid_request: 400,
  unavailable: 409,
  not_configured: 503,
  provider_error: 502,
};

function errorResponse(code: PaymentErrorCode) {
  return NextResponse.json({ code }, { status: STATUS_BY_CODE[code] });
}

export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = CheckoutRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse('invalid_request');
  }

  try {
    const checkout = await createCheckoutLink(parsed.data, request.nextUrl.origin);
    return NextResponse.json(checkout, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    if (err instanceof PaymentError) {
      console.warn(`[MercadoPago] ${err.code}: ${err.message}`);
      return errorResponse(err.code);
    }
    console.error('[MercadoPago] unexpected error', err instanceof Error ? err.message : 'unknown');
    return errorResponse('provider_error');
  }
}
