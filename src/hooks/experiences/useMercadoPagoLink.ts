'use client';

import { useState } from 'react';
import type { ReservationState } from '@/lib/schemas';

/** Allowed payment-redirect hostnames – add new providers here. */
const ALLOWED_PAYMENT_HOSTS = [
  'www.mercadopago.com',
  'www.mercadopago.com.co',
  'www.mercadopago.com.ar',
  'www.mercadopago.com.mx',
  'www.mercadopago.com.br',
] as const;

/**
 * Validates that a URL is safe to redirect to (no open-redirect).
 * Only https:// URLs pointing to known payment hosts are accepted.
 */
function isSafePaymentUrl(raw: unknown): raw is string {
  if (typeof raw !== 'string') return false;
  try {
    const parsed = new URL(raw);
    return (
      parsed.protocol === 'https:' &&
      (ALLOWED_PAYMENT_HOSTS as readonly string[]).includes(parsed.hostname)
    );
  } catch {
    return false;
  }
}

export function useMercadoPagoLink(experienceId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLink = async (reservation: ReservationState) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/payments/mercadopago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experienceId,
          depositAmount: reservation.pricing.depositAmount,
          contact: reservation.contact,
          dateId: reservation.selectedDateId,
          dateLabel: reservation.selectedDateLabel,
          peopleCount: reservation.peopleCount,
          roomSelections: reservation.roomSelections,
          transportMode: reservation.transportMode,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment link');
      }

      const { url } = await response.json();

      if (!isSafePaymentUrl(url)) {
        throw new Error('Received unsafe payment URL');
      }

      // Redirect to Mercado Pago
      if (typeof window !== 'undefined') {
        window.location.href = url;
      }
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  return { createLink, loading, error };
}
