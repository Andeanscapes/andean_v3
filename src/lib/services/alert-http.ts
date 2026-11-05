/**
 * JSON POST for alert channels, with a timeout and a delivery verdict — server only.
 */

import type { SendResult } from './payment-alert.types';

const ALERT_TIMEOUT_MS = 5000;

/**
 * Rate limits, server errors and network failures are transient (`retry`); any
 * other HTTP error is a configuration problem a retry cannot fix (`rejected`).
 */
export async function postAlert(
  channel: string,
  url: string,
  headers: Record<string, string>,
  body: unknown,
): Promise<SendResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ALERT_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    console.warn(`[PaymentAlert] ${channel} request failed`);
    return 'retry';
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.ok) return 'sent';
  console.warn(`[PaymentAlert] ${channel} rejected (${response.status})`);
  return response.status === 429 || response.status >= 500 ? 'retry' : 'rejected';
}
