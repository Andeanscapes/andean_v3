'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { APIError, apiCall } from '@/lib/api-client';
import type { ReservationState } from '@/lib/schemas';
import type { CheckoutResponse } from '@/lib/schemas/payment.schema';

/**
 * Starts Mercado Pago checkout in a new tab, so the booking stays open here and
 * can follow the payment. `onCheckoutStarted` receives the reference to poll.
 */
export function useMercadoPagoLink(
  experienceId: string,
  onCheckoutStarted?: (checkout: CheckoutResponse) => void,
) {
  const t = useTranslations('experiences.ui');
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Same-tab fallback: pressing Back from Mercado Pago restores this page from
  // the back/forward cache with the button still "processing".
  useEffect(() => {
    const onPageShow = (event: { persisted: boolean }) => {
      if (event.persisted) setLoading(false);
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  const createLink = async (reservation: ReservationState) => {
    setLoading(true);
    setError(null);
    // Opened before any `await`, while the click still counts as a user
    // gesture; opening after the request would be blocked as a popup.
    const checkoutTab = window.open('', '_blank');

    try {
      // The server re-prices from the feed, so no amount is sent.
      // No retry: each attempt creates a new Mercado Pago preference.
      const checkout = await apiCall<CheckoutResponse>('/payments/mercadopago', {
        method: 'POST',
        retry: 0,
        // The server checks the account, reads the feed and creates the
        // preference (up to ~8s each on a cold Worker): the 10s default is too short.
        timeout: 20000,
        body: JSON.stringify({
          experienceId,
          locale,
          selectedTierId: reservation.selectedTierId,
          selectedDateId: reservation.selectedDateId,
          roomSelections: reservation.roomSelections,
          transportMode: reservation.transportMode,
          contact: reservation.contact,
          termsAccepted: reservation.termsAccepted,
        }),
      });

      if (!checkoutTab || checkoutTab.closed) {
        // Blocked (e.g. in-app browsers): same-tab checkout, which returns
        // here with `?ref=` and is handled by the booking page.
        window.location.href = checkout.url;
        return;
      }

      // Cut the link back to this tab before loading a third-party page.
      checkoutTab.opener = null;
      checkoutTab.location.href = checkout.url;
      onCheckoutStarted?.(checkout);
      setLoading(false);
    } catch (err) {
      checkoutTab?.close();
      const unavailable = err instanceof APIError && err.statusCode === 409;
      setError(t(unavailable ? 'paymentUnavailableError' : 'paymentLinkError'));
      setLoading(false);
    }
  };

  return { createLink, loading, error };
}
