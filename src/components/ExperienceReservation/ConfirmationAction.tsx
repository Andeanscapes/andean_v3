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
import { reservationSchema } from '@/utils/validationSchemas';
import type { ExperienceConfig } from '@/lib/schemas';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { useThemeContext } from '@/contexts/ThemeContext';

interface ConfirmationActionProps {
  config: ExperienceConfig;
  whatsappLink: string;
}

export function ConfirmationAction({
  config,
  whatsappLink,
}: ConfirmationActionProps) {
  const t = useTranslations('experiences.ui');
  const { isValid, state, setTermsAccepted } = useReservationValidation();
  const { depositAmount } = useReservationPricing();
  const { createLink, loading, error } = useMercadoPagoLink(config.id);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [toastKey, setToastKey] = useState(0);
  const [showTermsToast, setShowTermsToast] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { currentLocale } = useLanguageContext();
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
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

    try {
      reservationSchema.parse({
        selectedDateId: state.selectedDateId,
        peopleCount: state.peopleCount,
        roomSelections: state.roomSelections,
        transportMode: state.transportMode,
        contact: state.contact,
        termsAccepted: state.termsAccepted,
      });

      await createLink(state);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t('validationError');
      setValidationError(errorMessage);
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
    state.selectedDateId !== null &&
    state.peopleCount >= 1 &&
    state.roomSelections.length > 0 &&
    state.transportMode !== null &&
    state.contact.name.length >= 2 &&
    state.contact.phone.length >= 7;

  const isButtonEnabled = (isReadyExceptTerms || isValid) && !loading;

  return (
    /* In-scroll on mobile; static in desktop sidebar. MobileStickyDock handles payment on mobile. */
    <div>
      <Card className={`w-full rounded-2xl !p-2 lg:!p-3 text-base-content shadow-2xl backdrop-blur-2xl ${isDark ? 'border border-white/15 bg-slate-900/95' : 'border border-neutral-200 bg-white/98'}`}>

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
            className="btn-md btn-primary shadow-lg hover:shadow-xl hover:shadow-[0_0_15px_rgba(0,168,107,0.4)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 disabled:opacity-70 disabled:shadow-md min-h-[48px] transition-all duration-200"
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
                  <span className="text-[10px] opacity-90">
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
            <p className="mt-1.5 flex items-center justify-center gap-1.5 rounded-xl border border-amber-400/15 bg-amber-400/10 px-2.5 py-1.5 text-xs font-medium text-amber-300">
              <TriangleAlert size={12} className="shrink-0" />
              {t('mobileDockMissingTerms')}
            </p>
          )}

          {/* Social proof */}
          <p className={`flex items-center justify-center gap-1.5 text-[11px] px-2 text-center ${isDark ? 'text-base-content/60' : 'text-base-content/70'}`}>
            <span className="relative inline-flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" style={{ animationDuration: '1.8s' }} />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            {t('socialProofBookings')}
          </p>

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
            className="btn btn-ghost btn-xs w-full min-h-0 h-8 text-base-content/80 hover:text-base-content focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
          >
            {config.microcopy.ctaSecondary}
          </a>
        </div>
      </Card>

      {showTermsToast && typeof document !== 'undefined' && createPortal(
        <div key={toastKey} className="toast toast-top toast-end z-[9999]">
          <div className="flex items-center gap-2 rounded-xl border border-amber-400/15 bg-amber-400/10 px-3 py-2.5 text-xs font-medium text-amber-300 shadow-lg backdrop-blur-xl">
            <AlertCircle size={14} className="shrink-0" />
            <span>{t('termsToastMessage')}</span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
