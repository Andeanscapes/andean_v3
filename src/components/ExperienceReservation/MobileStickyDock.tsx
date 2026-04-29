'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button/Button';
import { useMercadoPagoLink } from '@/hooks/experiences/useMercadoPagoLink';
import {
  useReservationValidation,
  useReservationPricing,
} from '@/hooks/experiences/useReservationContext';
import { reservationSchema } from '@/utils/validationSchemas';
import type { ExperienceConfig } from '@/lib/schemas';
import { useLanguageContext } from '@/contexts/LanguageContext';

interface MobileStickyDockProps {
  config: ExperienceConfig;
}

export function MobileStickyDock({ config }: MobileStickyDockProps) {
  const t = useTranslations('experiences.ui');
  const { isValid, state } = useReservationValidation();
  const { depositAmount } = useReservationPricing();
  const { createLink, loading, error } = useMercadoPagoLink(config.id);
  const { currentLocale } = useLanguageContext();
  const [isVisible, setIsVisible] = useState(false);
  const [priceAnimated, setPriceAnimated] = useState(false);
  const prevDepositRef = useRef(depositAmount);
  const [validationError, setValidationError] = useState<string | null>(null);

  const localeMap: Record<string, string> = {
    en: 'en-US',
    es: 'es-CO',
    fr: 'fr-FR',
  };

  // Scroll-activate: show dock after user scrolls past #available-dates
  useEffect(() => {
    const target = document.getElementById('available-dates');
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  // Micro-animation when deposit amount changes after booking selections update.
  useEffect(() => {
    if (prevDepositRef.current !== depositAmount) {
      setPriceAnimated(true);
      prevDepositRef.current = depositAmount;
      const id = setTimeout(() => setPriceAnimated(false), 400);
      return () => clearTimeout(id);
    }
  }, [depositAmount]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(localeMap[currentLocale] ?? 'es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);

  const handlePayment = async () => {
    setValidationError(null);
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
      setValidationError(err instanceof Error ? err.message : t('validationError'));
    }
  };

  return (
    <div
      aria-hidden={!isVisible}
      className={`fixed inset-x-0 bottom-0 z-50 lg:hidden transition-transform duration-300 ease-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ boxShadow: '0 -10px 15px -3px rgba(0, 0, 0, 0.5)' }}
    >
      <div className="bg-black/80 backdrop-blur-md px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        {/* Social proof */}
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-white/50 mb-2 text-center">
          <span className="relative inline-flex h-1.5 w-1.5 shrink-0">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60"
              style={{ animationDuration: '1.8s' }}
            />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          {t('socialProofBookings')}
        </p>

        {(validationError || error) && (
          <p className="text-[11px] text-red-400 text-center mb-1.5">
            {validationError ?? error}
          </p>
        )}

        {/* Deposit info + CTA row */}
        <div className="flex items-center gap-3">
          {/* Left: deposit amount with roll animation on change */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-white/50 leading-none mb-0.5">
              {t('payTodayLabel')} ({config.depositPercent}%)
            </p>
            <p
              className={`text-base font-bold text-primary tabular-nums transition-all duration-200 ${
                priceAnimated ? 'scale-110 opacity-75' : 'scale-100 opacity-100'
              }`}
            >
              {depositAmount > 0 ? formatPrice(depositAmount) : '—'}
            </p>
          </div>

          {/* Right: compact pay button */}
          <Button
            onClick={handlePayment}
            disabled={!isValid || loading}
            className="btn-primary min-h-[48px] px-5 shrink-0 shadow-lg hover:shadow-[0_0_15px_rgba(0,168,107,0.4)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-60 transition-all duration-200"
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <span className="text-sm font-semibold">{config.microcopy.ctaPrimary}</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
