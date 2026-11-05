/**
 * Shared types for operator payment alerts. Kept apart from the services so the
 * channel senders and the dispatcher do not import each other.
 */

/** Mercado Pago's approved payment, as read by the status check. */
export interface ApprovedPayment {
  /** Mercado Pago operation number, the "Operación #" the customer sees. */
  paymentId: string;
  externalReference: string;
  amount: number | null;
  metadata: unknown;
  isSandbox: boolean;
}

export type AlertLine = { label: string; value: string } | { warning: string };

/** Channel-neutral alert content; each channel only renders it. */
export interface PaymentAlert {
  title: string;
  isSandbox: boolean;
  lines: AlertLine[];
  paymentId: string;
  externalReference: string;
}

/**
 * `sent`: delivered. `retry`: transient failure, a later status check may try
 * again. `rejected`: the channel refused it and retrying would not help.
 */
export type SendResult = 'sent' | 'retry' | 'rejected';

export type AlertEnv = Record<string, string | undefined>;
