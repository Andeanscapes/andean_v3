'use client';

import { memo, useId, useMemo } from 'react';
import { useLocale } from 'next-intl';
import { ArrowRight, MessageCircle, ShieldCheck, Star, Undo2 } from 'lucide-react';
import type { ExperienceData } from '@/lib/schemas';
import { formatDateRange } from '@/utils/dateFormatters';
import { PrimaryCtaButton } from '@/components/ui/Button/PrimaryCtaButton';
import { Card } from '@/components/ui/Card/Card';
import { useThemeContext } from '@/contexts/ThemeContext';

interface ExpericeWidgetProps {
  experienceData: ExperienceData;
}

function ExpericeWidgetComponent({
  experienceData,
}: ExpericeWidgetProps) {
  const widgetId = useId();
  const locale = useLocale();
  const { theme } = useThemeContext();
  const { config, availableDates, transportOptions, whatsappLink, widgetContent } = experienceData;

  const nextDateLabel = useMemo(() => {
    const firstAvailableDate = availableDates.find((date) => date.isAvailable);

    if (!firstAvailableDate) {
      return widgetContent?.fallbackDateLabel ?? 'Available Dates';
    }

    return formatDateRange(firstAvailableDate.startDate, firstAvailableDate.endDate, locale);
  }, [availableDates, locale, widgetContent?.fallbackDateLabel]);

  const formattedPrice = useMemo(() => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(config.experiencePricePerPerson);
  }, [config.experiencePricePerPerson, locale]);

  const isDarkTheme = theme === 'dark';

  const cardClass = isDarkTheme
    ? 'relative border border-white/15 bg-slate-900/45 p-4 shadow-none backdrop-blur-xl md:p-8'
    : 'relative border border-neutral-200 bg-white/95 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.18)] md:p-8';

  const overlayClass = isDarkTheme
    ? 'pointer-events-none absolute inset-0 rounded-[inherit] bg-slate-950/35'
    : 'pointer-events-none absolute inset-0 rounded-[inherit] bg-white/80';

  const selectClass = isDarkTheme
    ? 'select select-bordered w-full border-white/20 bg-slate-900/85 text-base-content'
    : 'select select-bordered w-full border-neutral-300 bg-neutral-100 text-neutral-900';

  const mutedTextClass = isDarkTheme ? 'text-base-content/60' : 'text-neutral-700';
  const bodyTextClass = isDarkTheme ? 'text-base-content/70' : 'text-neutral-700';
  const iconClass = isDarkTheme ? 'text-[#00F08F]' : 'text-emerald-600';
  const whatsappSecondaryCtaClass = isDarkTheme
    ? 'btn btn-outline mt-3 h-auto min-h-12 w-full gap-2 border-white/40 bg-slate-900/40 text-white hover:bg-slate-900/60 md:mt-4'
    : 'btn btn-outline mt-3 h-auto min-h-12 w-full gap-2 border-neutral-300 bg-white/70 text-neutral-900 hover:bg-neutral-100 md:mt-4';

  return (
    <>
      <Card
        padding="md"
        className={cardClass}
      >
        <div className={overlayClass} />

        <span className="absolute -top-2 left-3 rounded-sm bg-[#00F08F] px-2.5 py-1 text-[9px] font-bold tracking-widest text-black shadow-[0_0_10px_rgba(0,240,143,0.4)] md:-top-3 md:-left-2 md:px-3 md:text-[10px]">
          {widgetContent?.topSellerLabel}
        </span>

        <div className="relative z-10 space-y-4 md:space-y-5">
          <div>
            <p className="mt-2 text-2xl font-extrabold text-base-content md:mt-0 md:text-3xl">
              {formattedPrice}
              <span className={`ml-1 text-[10px] font-normal tracking-wide md:text-xs ${mutedTextClass}`}>
                {widgetContent?.perPersonLabel}
              </span>
            </p>
            <div className="mt-1 flex items-center">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={14}
                    fill="currentColor"
                    stroke="currentColor"
                    className={iconClass}
                  />
                ))}
              </div>
              <span className={`ml-2 text-xs ${mutedTextClass}`}>
                {widgetContent?.reviewsCountLabel}
              </span>
            </div>
            <p className={`text-sm ${bodyTextClass}`}>{widgetContent?.onSelectedDatesLabel}</p>
          </div>

          <div className="space-y-1">
            <label htmlFor={`${widgetId}-date`} className="text-sm font-medium text-base-content/90">
              {widgetContent?.selectDateLabel}
            </label>
            <select
              id={`${widgetId}-date`}
              className={selectClass}
            >
              <option>{nextDateLabel}</option>
              {availableDates
                .filter((date) => date.isAvailable)
                .map((date) => (
                  <option key={date.id} value={date.id}>
                    {formatDateRange(date.startDate, date.endDate, locale)}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-1.5 sm:gap-2 md:gap-3">
            <div className="space-y-1">
              <label htmlFor={`${widgetId}-people`} className="text-sm font-medium text-base-content/90">{widgetContent?.peopleLabel}</label>
              <select
                id={`${widgetId}-people`}
                className={selectClass}
              >
                {Array.from({ length: config.maxPeople - config.minPeople + 1 }).map((_, idx) => {
                  const value = config.minPeople + idx;
                  return (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor={`${widgetId}-transport`} className="text-sm font-medium text-base-content/90">{widgetContent?.howToArriveLabel}</label>
            <select
              id={`${widgetId}-transport`}
              className={selectClass}
            >
              {transportOptions.map((transport) => (
                <option key={transport.value} value={transport.value}>
                  {transport.label}
                </option>
              ))}
            </select>
          </div>

          <PrimaryCtaButton size="lg" className="w-full py-3 md:py-4">
            <span className="inline-flex items-center gap-2">
              {widgetContent?.bookingButtonLabel}
              <ArrowRight size={18} className="flex-shrink-0" />
            </span>
          </PrimaryCtaButton>

          <div className={`flex flex-col gap-1 text-sm ${bodyTextClass}`}>
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className={iconClass} />
              <span>{widgetContent?.securityLine}</span>
            </div>
            <div className="flex items-center gap-2">
              <Undo2 size={14} className={iconClass} />
              <span>{widgetContent?.freeCancellationLine}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star size={14} className={iconClass} />
              <span>{widgetContent?.verifiedReviewsLine}</span>
            </div>
          </div>
        </div>
      </Card>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className={whatsappSecondaryCtaClass}
      >
        <MessageCircle size={18} className="flex-shrink-0" />
        {widgetContent?.whatsappCtaLabel}
      </a>
    </>
  );
}

ExpericeWidgetComponent.displayName = 'ExpericeWidget';

export default memo(ExpericeWidgetComponent);