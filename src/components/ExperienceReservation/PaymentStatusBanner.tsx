'use client';

import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { useTranslations } from 'next-intl';
import { AlertCircle, CheckCircle2, Clock, MessageCircle } from 'lucide-react';
import { apiCall } from '@/lib/api-client';
import type { PaymentStatusResponse } from '@/lib/schemas/payment.schema';
import { stripPaymentReturnParams } from '@/utils/paymentReturn';
import { whatsappUrl } from '@/utils/whatsapp';

interface PaymentStatusBannerProps {
  /** Our payment reference (UUID). */
  reference: string;
  /** Mercado Pago's `?payment_id=` from a same-tab return, when present. Verified server-side. */
  paymentId: string | null;
  /**
   * Set when checkout was opened in another tab from this page. The banner then
   * keeps watching the payment instead of checking once.
   */
  checkoutUrl: string | null;
  /** Translated experience title, quoted in the WhatsApp confirmation message. */
  experienceTitle: string;
  /** Each settled Mercado Pago result. Must be stable (e.g. `useCallback`): it is an effect dependency. */
  onResult: (status: PaymentStatusResponse['status']) => void;
}

type Status = PaymentStatusResponse['status'];
type BannerState =
  | { phase: 'loading' }
  | { phase: 'waiting' }
  | { phase: 'done'; status: Status }
  | { phase: 'error' };

/** Return mode: Mercado Pago's search can lag a just-made payment, so retry before "not found". */
const NOT_FOUND_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
/** Watch mode: poll while this tab is visible, for as long as a checkout plausibly takes. */
const POLL_INTERVAL_MS = 5000;
const WATCH_WINDOW_MS = 20 * 60 * 1000;

const STATUS_KEY: Record<Status, 'paymentStatusApproved' | 'paymentStatusPending' | 'paymentStatusRejected' | 'paymentStatusNotFound'> = {
  approved: 'paymentStatusApproved',
  pending: 'paymentStatusPending',
  rejected: 'paymentStatusRejected',
  not_found: 'paymentStatusNotFound',
};

type TitleKey =
  | 'paymentTitleApproved'
  | 'paymentTitlePending'
  | 'paymentTitleRejected'
  | 'paymentTitleUnconfirmed'
  | 'paymentTitleWaiting'
  | 'paymentTitleChecking';

const TITLE_KEY: Record<Status, TitleKey> = {
  approved: 'paymentTitleApproved',
  pending: 'paymentTitlePending',
  rejected: 'paymentTitleRejected',
  not_found: 'paymentTitleUnconfirmed',
};

const TONE_APPROVED = 'border-emerald-300/70 bg-emerald-50 text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-900/20 dark:text-emerald-200';
const TONE_WARNING = 'border-amber-300/70 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-900/20 dark:text-amber-200';
const TONE_REJECTED = 'border-red-300/70 bg-red-50 text-red-900 dark:border-red-500/30 dark:bg-red-900/20 dark:text-red-200';
const TONE_NEUTRAL = 'border-base-content/10 bg-base-100 text-base-content/80';

function statusPath(reference: string, paymentId: string | null): string {
  const query = new URLSearchParams({ ref: reference });
  if (paymentId) query.set('payment_id', paymentId);
  return `/payments/mercadopago/status?${query.toString()}`;
}

export function PaymentStatusBanner({ reference, paymentId, checkoutUrl, experienceTitle, onResult }: PaymentStatusBannerProps) {
  const t = useTranslations('experiences.ui');
  const isWatching = checkoutUrl !== null;
  const [state, setState] = useState<BannerState>(isWatching ? { phase: 'waiting' } : { phase: 'loading' });
  const bannerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<ComponentRef<'h2'>>(null);

  // Checkout may start from the sidebar or the mobile dock; bring the banner into view.
  useEffect(() => {
    if (isWatching) bannerRef.current?.scrollIntoView({ block: 'center' });
  }, [isWatching]);

  // A final result is the most important thing on the page: show it and move focus to it.
  // A failed poll while watching is transient (the next poll retries), so it is not final.
  const isFinal = state.phase === 'done' || (state.phase === 'error' && !isWatching);
  useEffect(() => {
    if (!isFinal) return;
    bannerRef.current?.scrollIntoView({ block: 'center' });
    titleRef.current?.focus({ preventScroll: true });
    // Back from Mercado Pago in this tab: drop the payment parameters once read,
    // so a shared or bookmarked link does not show this payment to someone else.
    if (!isWatching) {
      window.history.replaceState(window.history.state, '', stripPaymentReturnParams(window.location.href));
    }
  }, [isFinal, isWatching]);

  useEffect(() => {
    let active = true;
    let done = false;
    let inFlight = false;
    let attempts = 0;
    let lastStatus: Status | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const startedAt = Date.now();

    const schedule = () => {
      if (!active || done) return;
      if (isWatching && Date.now() - startedAt > WATCH_WINDOW_MS) {
        // Stop watching. "Updates on its own" is no longer true, so settle on
        // the WhatsApp guidance unless a pending/rejected result is already shown.
        done = true;
        if (lastStatus === null || lastStatus === 'not_found') setState({ phase: 'done', status: 'not_found' });
        return;
      }
      timeoutId = setTimeout(() => {
        // Hidden tab: wait for `visibilitychange` instead of polling in the background.
        if (isWatching && document.hidden) return;
        void check();
      }, isWatching ? POLL_INTERVAL_MS : RETRY_DELAY_MS);
    };

    const check = async () => {
      if (!active || done || inFlight) return;
      inFlight = true;
      let status: Status | null = null;
      try {
        ({ status } = await apiCall<PaymentStatusResponse>(statusPath(reference, paymentId), { retry: 0 }));
      } catch {
        status = null;
      }
      inFlight = false;
      if (!active) return;
      attempts += 1;
      if (status !== null) lastStatus = status;

      if (status === 'approved') {
        done = true;
        onResult(status);
        setState({ phase: 'done', status });
        return;
      }

      if (isWatching) {
        // A rejected card can be retried in the same Mercado Pago tab, so keep watching.
        if (status === 'pending' || status === 'rejected') onResult(status);
        setState(status === null ? { phase: 'error' } : status === 'not_found' ? { phase: 'waiting' } : { phase: 'done', status });
        schedule();
        return;
      }

      if (status === 'not_found' && attempts <= NOT_FOUND_RETRIES) {
        schedule();
        return;
      }
      done = true;
      if (status !== null) onResult(status);
      setState(status === null ? { phase: 'error' } : { phase: 'done', status });
    };

    const onVisibilityChange = () => {
      if (document.hidden) return;
      clearTimeout(timeoutId);
      void check();
    };

    if (isWatching) {
      // Back from the Mercado Pago tab: check right away, then resume polling.
      document.addEventListener('visibilitychange', onVisibilityChange);
      schedule();
    } else {
      void check();
    }

    return () => {
      active = false;
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [reference, paymentId, isWatching, onResult]);

  const isApproved = state.phase === 'done' && state.status === 'approved';
  let tone = TONE_NEUTRAL;
  let Icon = Clock;
  let titleKey: TitleKey = 'paymentTitleChecking';
  let message = t('paymentChecking');
  if (state.phase === 'waiting') {
    titleKey = 'paymentTitleWaiting';
    message = t('paymentWaiting', { reference });
  } else if (state.phase === 'error') {
    tone = TONE_WARNING;
    Icon = AlertCircle;
    titleKey = 'paymentTitleUnconfirmed';
    message = t('paymentStatusError', { reference });
  } else if (state.phase === 'done') {
    titleKey = TITLE_KEY[state.status];
    message = t(STATUS_KEY[state.status], { reference });
    tone = isApproved ? TONE_APPROVED : state.status === 'rejected' ? TONE_REJECTED : TONE_WARNING;
    Icon = isApproved ? CheckCircle2 : state.status === 'rejected' ? AlertCircle : Clock;
  }

  // No backend to message the customer yet: they open the chat with us instead,
  // so the team gets the reference right away and confirms by hand.
  const whatsappHref = isFinal
    ? whatsappUrl(
        t(isApproved ? 'paymentWhatsappApprovedMessage' : 'paymentWhatsappHelpMessage', {
          title: experienceTitle,
          reference,
        }),
      )
    : null;

  return (
    <section
      ref={bannerRef}
      aria-labelledby="payment-status-title"
      className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 sm:p-5 ${tone}`}
    >
      <Icon size={isFinal ? 28 : 20} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <h2
          id="payment-status-title"
          ref={titleRef}
          tabIndex={-1}
          className={`font-semibold focus:outline-none ${isFinal ? 'text-lg sm:text-xl' : 'text-base'}`}
        >
          {t(titleKey)}
        </h2>
        {/* One persistent live region: only its text changes, so screen readers announce each update. */}
        <p role="status" className="mt-1 text-sm">
          {message}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary min-h-11 h-11 gap-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
            >
              <MessageCircle size={18} aria-hidden="true" />
              {t(isApproved ? 'paymentWhatsappApprovedCta' : 'paymentWhatsappHelpCta')}
              <span className="sr-only"> {t('paymentOpensInNewTab')}</span>
            </a>
          )}
          {checkoutUrl && !isApproved && (
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              {t('paymentReopen')}
              <span className="sr-only"> {t('paymentOpensInNewTab')}</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
