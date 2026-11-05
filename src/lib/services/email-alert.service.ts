/**
 * Email delivery for operator payment alerts — server only, via Resend.
 *
 * Plain text only: nothing customer-provided is rendered as HTML, so there is
 * no markup to escape. Needs three server values; if any is missing the channel
 * is skipped:
 * - `RESEND_API_KEY` (secret)
 * - `ALERT_EMAIL_TO` (secret: the operator's inbox is personal data)
 * - `ALERT_EMAIL_FROM` (var: an address on a domain verified in Resend)
 */

import { postAlert } from './alert-http';
import type { AlertEnv, PaymentAlert, SendResult } from './payment-alert.types';

const RESEND_URL = 'https://api.resend.com/emails';

export function isEmailConfigured(env: AlertEnv): boolean {
  return Boolean(env.RESEND_API_KEY?.trim() && env.ALERT_EMAIL_TO?.trim() && env.ALERT_EMAIL_FROM?.trim());
}

export function renderEmailAlert(alert: PaymentAlert): { subject: string; text: string } {
  const prefix = alert.isSandbox ? '[SANDBOX] ' : '';
  const note = alert.isSandbox ? ['SANDBOX: sin dinero real.', ''] : [];
  const body = alert.lines.map((line) => ('warning' in line ? `⚠️ ${line.warning}` : `${line.label}: ${line.value}`));
  return {
    subject: `${prefix}${alert.title} · #${alert.paymentId}`,
    text: [...note, ...body].join('\n'),
  };
}

export async function sendEmailPaymentAlert(alert: PaymentAlert, env: AlertEnv): Promise<SendResult> {
  const apiKey = env.RESEND_API_KEY?.trim();
  const to = env.ALERT_EMAIL_TO?.trim();
  const from = env.ALERT_EMAIL_FROM?.trim();
  if (!apiKey || !to || !from) return 'rejected';

  const { subject, text } = renderEmailAlert(alert);
  return postAlert(
    'email',
    RESEND_URL,
    {
      Authorization: `Bearer ${apiKey}`,
      // Same key for retries of the same payment: the provider drops duplicates.
      'Idempotency-Key': `payment-alert-${alert.paymentId}`,
    },
    { from, to: [to], subject, text },
  );
}
