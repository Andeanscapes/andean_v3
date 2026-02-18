'use client';

import { useState } from 'react';
import type { ReservationState } from '@/lib/experiences/types';

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
          roomMode: reservation.roomMode,
          transportMode: reservation.transportMode,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment link');
      }

      const { url } = await response.json();

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
