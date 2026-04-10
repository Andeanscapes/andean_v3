'use client';

import { memo, useId, useMemo } from 'react';
import { useLocale } from 'next-intl';
import { ArrowRight, MessageCircle, ShieldCheck, Star, Undo2 } from 'lucide-react';
import type { ExperienceData } from '@/lib/schemas';
import { formatDateRange } from '@/utils/dateFormatters';
import { PrimaryCtaButton } from '@/components/ui/Button/PrimaryCtaButton';
import { Card } from '@/components/ui/Card/Card';

interface ExpericeWidgetProps {
  experienceData: ExperienceData;
}

function ExpericeWidgetComponent({
  experienceData,
}: ExpericeWidgetProps) {
  const widgetId = useId();
  const locale = useLocale();
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
    }).format(config.basePricePerPerson);
  }, [config.basePricePerPerson, locale]);

  return (
    <>
      <Card
        padding="md"
        className="relative border border-neutral-300 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.18)] md:p-8 dark:border-white/20 dark:shadow-none"
      >
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-white dark:bg-base-100/10 dark:backdrop-blur-md" />

        <span className="absolute -top-2 left-3 rounded-sm bg-[#00F08F] px-2.5 py-1 text-[9px] font-bold tracking-widest text-black shadow-[0_0_10px_rgba(0,240,143,0.4)] md:-top-3 md:-left-2 md:px-3 md:text-[10px]">
          {widgetContent?.topSellerLabel}
        </span>

        <div className="relative z-10 space-y-4 md:space-y-5">
          <div>
            <p className="mt-2 text-2xl font-extrabold text-base-content md:mt-0 md:text-3xl">
              {formattedPrice}
              <span className="ml-1 text-[10px] font-normal tracking-wide text-neutral-700 dark:text-base-content/60 md:text-xs">
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
                    className="text-emerald-600 dark:text-[#00F08F]"
                  />
                ))}
              </div>
              <span className="ml-2 text-xs text-neutral-700 dark:text-base-content/60">
                {widgetContent?.reviewsCountLabel}
              </span>
            </div>
            <p className="text-sm text-neutral-700 dark:text-base-content/70">{widgetContent?.onSelectedDatesLabel}</p>
          </div>

          <div className="space-y-1">
            <label htmlFor={`${widgetId}-date`} className="text-sm font-medium text-base-content/90">
              {widgetContent?.selectDateLabel}
            </label>
            <select
              id={`${widgetId}-date`}
              className="select select-bordered w-full border-neutral-300 bg-neutral-100 text-neutral-900 dark:border-white/20 dark:bg-base-100/95 dark:text-base-content"
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
                className="select select-bordered w-full border-neutral-300 bg-neutral-100 text-neutral-900 dark:border-white/20 dark:bg-base-100/95 dark:text-base-content"
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
              className="select select-bordered w-full border-neutral-300 bg-neutral-100 text-neutral-900 dark:border-white/20 dark:bg-base-100/95 dark:text-base-content"
            >
              {transportOptions.map((transport) => (
                <option key={transport.value} value={transport.value}>
                  {transport.label}
                </option>
              ))}
            </select>
          </div>

          <PrimaryCtaButton size="lg" className="w-full py-3 text-neutral-900 md:py-4 dark:text-black">
            <span className="inline-flex items-center gap-2">
              {widgetContent?.bookingButtonLabel}
              <ArrowRight size={18} className="flex-shrink-0" />
            </span>
          </PrimaryCtaButton>

          <div className="flex flex-col gap-1 text-sm text-neutral-700 dark:text-base-content/70">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-600 dark:text-[#00F08F]" />
              <span>{widgetContent?.securityLine}</span>
            </div>
            <div className="flex items-center gap-2">
              <Undo2 size={14} className="text-emerald-600 dark:text-[#00F08F]" />
              <span>{widgetContent?.freeCancellationLine}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star size={14} className="text-emerald-600 dark:text-[#00F08F]" />
              <span>{widgetContent?.verifiedReviewsLine}</span>
            </div>
          </div>
        </div>
      </Card>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-outline mt-3 w-full gap-2 h-auto min-h-12 hover:bg-base-200 md:mt-4 dark:border-white/40 dark:bg-base-100/10 dark:text-white dark:hover:bg-base-100/20"
      >
        <MessageCircle size={18} className="flex-shrink-0" />
        {widgetContent?.whatsappCtaLabel}
      </a>
    </>
  );
}

ExpericeWidgetComponent.displayName = 'ExpericeWidget';

export default memo(ExpericeWidgetComponent);