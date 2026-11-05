'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { AlertCircle, TriangleAlert } from 'lucide-react';
import { Card } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { useMercadoPagoLink } from '@/hooks/experiences/useMercadoPagoLink';
import {
  useReservationValidation,
  useReservationPricing,
} from '@/hooks/experiences/useReservationContext';
import { buildReservationSchema, resolveReservationError } from '@/utils/validationSchemas';
import type { ExperienceConfig } from '@/lib/schemas';
import type { CheckoutResponse } from '@/lib/schemas/payment.schema';
import { useLanguageContext } from '@/contexts/LanguageContext';

interface ConfirmationActionProps {
  config: ExperienceConfig;
  whatsappLink: string;
  /** A deposit is approved, pending, or open in another tab: block a second payment. */
  paymentLocked?: boolean;
  onCheckoutStarted?: (checkout: CheckoutResponse) => void;
}

export function ConfirmationAction({
  config,
  whatsappLink,
  paymentLocked = false,
  onCheckoutStarted,
}: ConfirmationActionProps) {
  const t = useTranslations('experiences.ui');
  const { isValid, isTierMissing, state, setTermsAccepted } = useReservationValidation();
  const { depositAmount } = useReservationPricing();
  const { createLink, loading, error } = useMercadoPagoLink(config.id, onCheckoutStarted);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [toastKey, setToastKey] = useState(0);
  const [showTermsToast, setShowTermsToast] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { currentLocale } = useLanguageContext();
  const localeMap: Record<string, string> = {
    en: 'en-US',
    es: 'es-CO',
    fr: 'fr-FR',
  };

  const handlePayment = async () => {
    setValidationError(null);

    if (!state.termsAccepted) {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setToastKey((k) => k + 1);
      setShowTermsToast(true);
      toastTimerRef.current = setTimeout(() => setShowTermsToast(false), 3500);
      return;
    }

    const bounds = { minPeople: config.minPeople, maxPeople: config.maxPeople };

    try {
      buildReservationSchema(bounds).parse({
        selectedDateId: state.selectedDateId,
        peopleCount: state.peopleCount,
        roomSelections: state.roomSelections,
        transportMode: state.transportMode,
        contact: state.contact,
        termsAccepted: state.termsAccepted,
      });

      await createLink(state);
    } catch (err) {
      setValidationError(resolveReservationError(err, t, bounds));
    }
  };

  // Cleanup toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // All fields valid except terms — button active but shows toast on click
  const isReadyExceptTerms =
    !isTierMissing &&
    state.selectedDateId !== null &&
    state.peopleCount >= 1 &&
    state.roomSelections.length > 0 &&
    state.transportMode !== null &&
    state.contact.name.length >= 2 &&
    state.contact.phone.length >= 7;

  const isButtonEnabled = (isReadyExceptTerms || isValid) && !loading && !paymentLocked;

  return (
    /* In-scroll on mobile; static in desktop sidebar. MobileStickyDock handles payment on mobile. */
    <div>
      <Card padding="sm" className="w-full rounded-2xl text-base-content">

        {/* Términos */}
        <label className="label cursor-pointer mb-1 text-base-content">
          <input
            type="checkbox"
            checked={state.termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="checkbox checkbox-primary"
            aria-label={t('termsCheckbox')}
          />
          <span className="label-text text-xs ml-2 text-base-content/90">
            {t('termsCheckbox')}
          </span>
        </label>

        {/* Error messages */}
        {validationError && (
          <div className="alert alert-error mb-2">
            <span className="text-sm">{validationError}</span>
          </div>
        )}
        {error && (
          <div className="alert alert-error mb-2">
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Helper text */}
        {!isValid && (
          <p className="text-xs text-base-content/90 mb-1 text-center">
            {t('completeRequiredFields')}
          </p>
        )}

        {/* Payment actions — desktop only; MobileStickyDock handles mobile */}
        <div className="hidden lg:block space-y-1 mt-2">
          <Button
            onClick={handlePayment}
            disabled={!isButtonEnabled}
            fullWidth
            className="btn-md btn-primary shadow-lg hover:shadow-xl active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 disabled:opacity-70 disabled:shadow-md min-h-[48px] transition-all duration-200"
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                {t('processing')}
              </>
            ) : (
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-semibold">
                  {config.microcopy.ctaPrimary}
                </span>
                {isValid && depositAmount > 0 && (
                  <span className="text-[11px] opacity-90">
                    {t('payTodayLabel')}: $
                    {depositAmount.toLocaleString(
                      localeMap[currentLocale] ?? 'es-CO',
                      {
                        maximumFractionDigits: 0,
                      }
                    )}
                  </span>
                )}
              </div>
            )}
          </Button>

          {/* Terms not accepted label — shown below button */}
          {isReadyExceptTerms && !state.termsAccepted && (
            <p className="mt-1.5 flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-medium border-amber-500/40 bg-amber-50 text-amber-700 dark:border-amber-400/15 dark:bg-amber-400/10 dark:text-amber-300">
              <TriangleAlert size={12} className="shrink-0" aria-hidden="true" />
              {t('mobileDockMissingTerms')}
            </p>
          )}

          <p className="text-xs text-center text-base-content/90">
            {t('paymentMethods')}
          </p>
        </div>

        {/* WhatsApp fallback — always visible */}
        <div className="mt-1.5">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline w-full min-h-11 h-11 border-base-content/20 bg-transparent text-base-content hover:border-base-content/30 hover:bg-base-200 hover:text-base-content dark:border-white/20 dark:hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
          >
            {config.microcopy.ctaSecondary}
          </a>
        </div>
      </Card>

      {showTermsToast && typeof document !== 'undefined' && createPortal(
        <div key={toastKey} className="toast toast-top toast-end z-[9999]">
          <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium shadow-lg backdrop-blur-xl border-amber-500/40 bg-amber-50 text-amber-700 dark:border-amber-400/15 dark:bg-amber-400/10 dark:text-amber-300">
            <AlertCircle size={14} className="shrink-0" aria-hidden="true" />
            <span>{t('termsToastMessage')}</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
