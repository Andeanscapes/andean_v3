'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button/Button';
import { useMercadoPagoLink } from '@/hooks/experiences/useMercadoPagoLink';
import {
  useReservationAccommodationTiers,
  useReservationDate,
  useReservationValidation,
  useReservationPricing,
  useReservationRoomModes,
  useReservationRooms,
  useReservationTier,
  useReservationTransport,
} from '@/hooks/experiences/useReservationContext';
import { reservationSchema } from '@/utils/validationSchemas';
import type { ExperienceConfig, TransportOption } from '@/lib/schemas';
import { useLanguageContext } from '@/contexts/LanguageContext';

interface MobileStickyDockProps {
  config: ExperienceConfig;
  transportOptions: TransportOption[];
}

export function MobileStickyDock({ config, transportOptions }: MobileStickyDockProps) {
  const t = useTranslations('experiences.ui');
  const { isValid, state } = useReservationValidation();
  const { total, depositAmount } = useReservationPricing();
  const { selectedDateLabel } = useReservationDate();
  const { selectedTierId } = useReservationTier();
  const tiersContent = useReservationAccommodationTiers();
  const { peopleCount, roomSelections } = useReservationRooms();
  const roomModes = useReservationRoomModes();
  const { transportMode } = useReservationTransport();
  const { createLink, loading, error } = useMercadoPagoLink(config.id);
  const { currentLocale } = useLanguageContext();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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

  useEffect(() => {
    if (!isExpanded) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsExpanded(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isExpanded]);

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

  const selectedTier = useMemo(
    () => tiersContent?.tiers.find((tier) => tier.id === selectedTierId) ?? null,
    [selectedTierId, tiersContent]
  );

  const selectedTransport = useMemo(
    () => transportOptions.find((option) => option.value === transportMode)?.label ?? null,
    [transportMode, transportOptions]
  );

  const roomSummary = useMemo(() => {
    if (roomSelections.length === 0) return null;

    return roomSelections
      .map((selection) => {
        const roomMode = roomModes.find((mode) => mode.value === selection.roomMode);
        return roomMode ? `${selection.quantity} x ${roomMode.label}` : null;
      })
      .filter((value): value is string => value !== null)
      .join(' · ');
  }, [roomModes, roomSelections]);

  const missingStep = useMemo(() => {
    if (!state.selectedDateId) return t('mobileDockMissingDate');
    if (state.peopleCount < 1 || state.roomSelections.length === 0) return t('mobileDockMissingRooms');
    if (!state.transportMode) return t('mobileDockMissingTransport');
    if (state.contact.name.length < 2 || state.contact.phone.length < 7) return t('mobileDockMissingContact');
    if (!state.termsAccepted) return t('mobileDockMissingTerms');
    return null;
  }, [state, t]);

  const summaryParts = [
    selectedDateLabel,
    peopleCount > 0 ? t('mobileDockPeopleSummary', { count: peopleCount }) : null,
    selectedTier?.tierLabel ?? null,
  ].filter((value): value is string => Boolean(value));

  const summaryText = summaryParts.length > 0
    ? summaryParts.join(' · ')
    : t('mobileDockEmptySummary');

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
        isVisible ? 'translate-y-0' : 'pointer-events-none translate-y-full'
      }`}
      style={{ boxShadow: '0 -10px 15px -3px rgba(0, 0, 0, 0.5)' }}
    >
      <div className="border-t border-white/10 bg-black/[0.88] px-4 pt-2.5 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setIsExpanded((value) => !value)}
          className="mb-2 flex w-full items-center justify-between gap-3 rounded-2xl border border-white/15 bg-slate-900/45 px-3 py-2 text-left shadow-[0_12px_36px_rgba(0,0,0,0.28)] backdrop-blur-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          aria-expanded={isExpanded}
          aria-controls="mobile-booking-summary"
          tabIndex={isVisible ? 0 : -1}
        >
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
              {t('mobileDockSummaryLabel')}
            </span>
            <span className="block truncate text-xs font-medium text-white/90">
              {summaryText}
            </span>
          </span>
          <span className="shrink-0 text-[11px] font-semibold text-primary">
            {isExpanded ? t('mobileDockHideDetails') : t('mobileDockViewDetails')}
          </span>
        </button>

        {isExpanded && (
          <div
            id="mobile-booking-summary"
            className="mb-2 max-h-[45vh] overflow-y-auto rounded-2xl border border-white/15 bg-slate-900/95 p-3 text-sm text-white shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
          >
            <dl className="grid grid-cols-[88px_1fr] gap-x-3 gap-y-2">
              <dt className="text-white/50">{t('mobileDockDate')}</dt>
              <dd className="font-medium text-white">{selectedDateLabel ?? t('mobileDockNotSelected')}</dd>

              <dt className="text-white/50">{t('mobileDockPeople')}</dt>
              <dd className="font-medium text-white">
                {peopleCount > 0 ? t('mobileDockPeopleSummary', { count: peopleCount }) : t('mobileDockNotSelected')}
              </dd>

              <dt className="text-white/50">{t('mobileDockStay')}</dt>
              <dd className="truncate font-medium text-white">{selectedTier?.tierLabel ?? t('mobileDockNotSelected')}</dd>

              <dt className="text-white/50">{t('mobileDockRoom')}</dt>
              <dd className="font-medium text-white">{roomSummary ?? t('mobileDockNotSelected')}</dd>

              <dt className="text-white/50">{t('mobileDockTransport')}</dt>
              <dd className="font-medium text-white">{selectedTransport ?? t('mobileDockNotSelected')}</dd>
            </dl>

            <div className="mt-3 border-t border-white/10 pt-3">
              <div className="flex items-center justify-between text-white/70">
                <span>{t('totalLabel')}</span>
                <span className="font-semibold text-white">{formatPrice(total)}</span>
              </div>
              {missingStep && (
                <p className="mt-2 rounded-xl border border-amber-400/15 bg-amber-400/10 px-2.5 py-1.5 text-xs font-medium text-amber-300">
                  {missingStep}
                </p>
              )}
            </div>
          </div>
        )}

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
            disabled={!isVisible || !isValid || loading}
            tabIndex={isVisible ? 0 : -1}
            className="btn-primary min-h-[48px] px-5 shrink-0 shadow-lg hover:shadow-[0_0_15px_rgba(0,168,107,0.4)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary/60 disabled:opacity-60 transition-all duration-200"
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              <span className="text-sm font-semibold">{config.microcopy.ctaPrimary}</span>
            )}
          </Button>
        </div>

        <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] text-white/50">
          <span className="relative inline-flex h-1.5 w-1.5 shrink-0">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60"
              style={{ animationDuration: '1.8s' }}
            />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          {missingStep ?? t('mobileDockTrustLine')}
        </p>
      </div>
    </div>
  );
}
