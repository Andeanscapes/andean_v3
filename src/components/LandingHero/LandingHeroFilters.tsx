'use client';

import { memo, useId, useMemo, useState, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { ArrowRight, MessageCircle, ShieldCheck, Star, Undo2, BadgeCheck } from 'lucide-react';
import type { LandingFlagshipContent } from '@/lib/schemas/landing.schema';
import { PrimaryCtaButton } from '@/components/ui/Button/PrimaryCtaButton';
import { Card } from '@/components/ui/Card/Card';
import { Select } from '@/components/ui/Select/Select';
import { useThemeContext } from '@/contexts/ThemeContext';
import { formatDateRange } from '@/utils/dateFormatters';
import { buildBookingUrl } from '@/utils/helpers';
import type { TransportMode } from '@/lib/schemas';

interface LandingHeroFiltersProps {
  flagship: LandingFlagshipContent;
}

function LandingHeroFiltersComponent({ flagship }: LandingHeroFiltersProps) {
  const widgetId = useId();
  const locale = useLocale();
  const { theme } = useThemeContext();

  const [selectedDateId, setSelectedDateId] = useState<string>('');
  const [peopleCount, setPeopleCount] = useState<number>(flagship.minPeople);
  const [transportMode, setTransportMode] = useState<TransportMode | ''>('');

  const { pricing, availableDates, transportOptions, whatsappLink, labels } = flagship;

  const isDark = theme === 'dark';

  const bookingHref = useMemo(
    () =>
      buildBookingUrl(`/experiences/${flagship.experienceSlug}/booking`, {
        date: selectedDateId || undefined,
        people: peopleCount,
        transport: (transportMode as TransportMode) || undefined,
      }),
    [flagship.experienceSlug, selectedDateId, peopleCount, transportMode],
  );

  const nextDateLabel = useMemo(() => {
    const first = availableDates.find((d) => d.isAvailable);
    if (!first) return labels.fallbackDateLabel;
    return formatDateRange(first.startDate, first.endDate, locale);
  }, [availableDates, locale, labels.fallbackDateLabel]);

  const formattedPrice = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: pricing.currency,
        maximumFractionDigits: 0,
      }).format(pricing.fromAmount),
    [locale, pricing],
  );

  const formattedDeposit = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: pricing.currency,
        maximumFractionDigits: 0,
      }).format(Math.round((pricing.fromAmount * pricing.depositPercent) / 100)),
    [locale, pricing],
  );

  const handleWhatsApp = useCallback(() => {
    window.open(whatsappLink, '_blank', 'noopener,noreferrer');
  }, [whatsappLink]);

  // Theme-aware CSS — mirrors ExpericeWidget exactly
  const cardClass = isDark
    ? 'relative border border-white/15 bg-slate-900/45 p-4 shadow-none backdrop-blur-xl md:p-6'
    : 'relative border border-neutral-200 bg-white/95 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.18)] md:p-6';

  const overlayClass = isDark
    ? 'pointer-events-none absolute inset-0 rounded-[inherit] bg-slate-950/35'
    : 'pointer-events-none absolute inset-0 rounded-[inherit] bg-white/80';

  const selectTriggerClass = isDark
    ? 'flex w-full items-center justify-between gap-2 rounded-lg border border-white/20 bg-slate-900 px-3 py-2.5 text-sm text-base-content transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F08F]/60'
    : 'flex w-full items-center justify-between gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/60';

  const selectPanelClass = isDark
    ? 'absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-white/15 bg-slate-900 shadow-[0_8px_32px_rgba(0,0,0,0.55)]'
    : 'absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)]';

  const selectOptionClass = isDark
    ? 'flex cursor-pointer select-none items-center px-3 py-2.5 text-sm text-base-content/90 transition-colors border-t border-white/8 first:border-t-0'
    : 'flex cursor-pointer select-none items-center px-3 py-2.5 text-sm text-neutral-800 transition-colors border-t border-neutral-200 first:border-t-0';

  const selectOptionHoverClass = isDark
    ? 'hover:bg-white/10 hover:text-white'
    : 'hover:bg-emerald-50 hover:text-emerald-900';

  const mutedTextClass = isDark ? 'text-base-content/60' : 'text-neutral-600';
  const bodyTextClass = isDark ? 'text-base-content/70' : 'text-neutral-700';
  const iconClass = isDark ? 'text-[#00F08F]' : 'text-emerald-600';

  return (
    <div>
      <Card padding="md" className={cardClass}>
        <div className={overlayClass} />

        <span className="absolute -top-2 left-3 rounded-sm bg-[#00F08F] px-2.5 py-1 text-[9px] font-bold tracking-widest text-black shadow-[0_0_10px_rgba(0,240,143,0.4)] md:-top-3 md:-left-2 md:px-3 md:text-[10px]">
          TOP SELLER
        </span>

        <div className="relative z-10 space-y-4">
          {/* Price + rating */}
          <div>
            <p className="mt-2 text-2xl font-extrabold text-base-content md:mt-0 md:text-3xl">
              <span className={`mr-1 text-sm font-normal tracking-wide md:text-base ${mutedTextClass}`}>
                {labels.fromLabel}
              </span>
              {formattedPrice}
              <span className={`ml-1 text-[10px] font-normal tracking-wide md:text-xs ${mutedTextClass}`}>
                {labels.perPersonLabel}
              </span>
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <div className="flex items-center gap-0.5" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} fill="currentColor" stroke="currentColor" className={iconClass} />
                ))}
              </div>
              <span className={`text-xs ${mutedTextClass}`}>
                <span className="sr-only">Rating: {flagship.reviewsRating} out of 5. </span>
                {labels.reviewsCountLabel}
              </span>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-1">
            <label htmlFor={`${widgetId}-date`} className="text-sm font-medium text-base-content/90">
              {labels.selectDateLabel}
            </label>
            <Select
              id={`${widgetId}-date`}
              options={[
                { value: '', label: nextDateLabel },
                ...availableDates
                  .filter((d) => d.isAvailable)
                  .map((d) => ({ value: d.id, label: formatDateRange(d.startDate, d.endDate, locale) })),
              ]}
              value={selectedDateId}
              onChange={(v) => setSelectedDateId(String(v))}
              triggerClassName={selectTriggerClass}
              panelClassName={selectPanelClass}
              optionClassName={selectOptionClass}
              optionHoverClassName={selectOptionHoverClass}
            />
          </div>

          {/* People */}
          <div className="space-y-1">
            <label htmlFor={`${widgetId}-people`} className="text-sm font-medium text-base-content/90">
              {labels.peopleLabel}
            </label>
            <Select
              id={`${widgetId}-people`}
              options={Array.from({ length: flagship.maxPeople - flagship.minPeople + 1 }).map((_, idx) => {
                const v = flagship.minPeople + idx;
                return { value: v, label: String(v) };
              })}
              value={peopleCount}
              onChange={(v) => setPeopleCount(Number(v))}
              triggerClassName={selectTriggerClass}
              panelClassName={selectPanelClass}
              optionClassName={selectOptionClass}
              optionHoverClassName={selectOptionHoverClass}
            />
          </div>

          {/* Arrival method */}
          <div className="space-y-1">
            <label htmlFor={`${widgetId}-transport`} className="text-sm font-medium text-base-content/90">
              {labels.arrivalLabel}
            </label>
            <Select
              id={`${widgetId}-transport`}
              options={[{ value: '', label: labels.arrivalLabel }, ...transportOptions]}
              value={transportMode}
              onChange={(v) => setTransportMode(v as TransportMode | '')}
              triggerClassName={selectTriggerClass}
              panelClassName={selectPanelClass}
              optionClassName={selectOptionClass}
              optionHoverClassName={selectOptionHoverClass}
            />
          </div>

          {/* Primary CTA */}
          <PrimaryCtaButton href={bookingHref} size="lg" className="w-full py-3 md:py-4">
            <span className="inline-flex items-center gap-2">
              {labels.ctaLabel}
              <ArrowRight size={18} className="flex-shrink-0" aria-hidden="true" />
            </span>
          </PrimaryCtaButton>

          {/* Deposit note */}
          <p className={`text-center text-xs ${mutedTextClass}`}>
            Pay only {formattedDeposit} now
          </p>

          {/* Trust lines */}
          <div className={`flex flex-col gap-1 text-sm ${bodyTextClass}`}>
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className={iconClass} aria-hidden="true" />
              <span>{labels.trustSecureLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Undo2 size={14} className={iconClass} aria-hidden="true" />
              <span>{labels.trustCancellationLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <BadgeCheck size={14} className={iconClass} aria-hidden="true" />
              <span>{labels.trustVerifiedLabel}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* WhatsApp CTA */}
      <button
        type="button"
        onClick={handleWhatsApp}
        aria-label={labels.whatsappCtaLabel}
        className={
          isDark
            ? 'btn btn-outline mt-3 h-auto min-h-12 w-full gap-2 border-white/40 bg-slate-900/40 text-white hover:bg-slate-900/60 md:mt-4'
            : 'btn btn-outline mt-3 h-auto min-h-12 w-full gap-2 border-neutral-300 bg-white/70 text-neutral-900 hover:bg-neutral-100 md:mt-4'
        }
      >
        <MessageCircle size={18} className="flex-shrink-0" aria-hidden="true" />
        {labels.whatsappCtaLabel}
      </button>
    </div>
  );
}

LandingHeroFiltersComponent.displayName = 'LandingHeroFilters';

export default memo(LandingHeroFiltersComponent);
