import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import {
  MercadoPagoPaymentIdSchema,
  PaymentReferenceSchema,
  type PaymentStatusResponse,
} from '@/lib/schemas/payment.schema';
import {
  buildPaymentAlert,
  dispatchPaymentAlert,
  hasAlertChannel,
  type ApprovedPayment,
  type PaymentAlert,
} from '@/lib/services/payment-alert.service';
import { getPaymentStatus, PaymentError } from '@/lib/services/mercadopago.service';

const NO_STORE = { 'Cache-Control': 'no-store' };

function logAlertFailure(stage: string, err: unknown): void {
  console.warn(`[PaymentAlert] ${stage} failed: ${err instanceof Error ? err.message : 'unknown'}`);
}

/**
 * The alert is built here, inside the request: building translates the
 * experience title, and next-intl reads request scope. Sending happens after
 * the response (`waitUntil`), so a slow Telegram or email never delays the
 * customer. Outside Workers (`next dev`) there is no `waitUntil`; the promise
 * then keeps running in the Node process.
 */
async function queueAlerts(payment: ApprovedPayment, origin: string): Promise<void> {
  if (!hasAlertChannel()) return;

  let alert: PaymentAlert;
  try {
    alert = await buildPaymentAlert(payment);
  } catch (err) {
    logAlertFailure('build', err);
    return;
  }

  const task = dispatchPaymentAlert(alert, origin).catch((err: unknown) => logAlertFailure('dispatch', err));
  try {
    getCloudflareContext().ctx.waitUntil(task);
  } catch {
    // Not on Workers: the task keeps running.
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const reference = PaymentReferenceSchema.safeParse(searchParams.get('ref'));
  if (!reference.success) {
    return NextResponse.json({ code: 'invalid_request' }, { status: 400, headers: NO_STORE });
  }
  // Optional and untrusted: the service only uses it if the payment carries our reference.
  const paymentId = MercadoPagoPaymentIdSchema.safeParse(searchParams.get('payment_id'));

  try {
    const lookup = await getPaymentStatus(reference.data, paymentId.success ? paymentId.data : undefined);
    if (lookup.approvedPayment) await queueAlerts(lookup.approvedPayment, request.nextUrl.origin);

    const body: PaymentStatusResponse = { status: lookup.status };
    return NextResponse.json(body, { status: 200, headers: NO_STORE });
  } catch (err) {
    const code = err instanceof PaymentError ? err.code : 'provider_error';
    console.warn(`[MercadoPago] status ${code}: ${err instanceof Error ? err.message : 'unknown'}`);
    return NextResponse.json({ code }, { status: 502, headers: NO_STORE });
  }
}
