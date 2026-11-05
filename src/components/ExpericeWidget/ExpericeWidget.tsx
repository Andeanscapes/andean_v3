'use client';

import { memo, useId, useMemo } from 'react';
import { useLocale } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { ArrowRight, MessageCircle, ShieldCheck, Star, Undo2 } from 'lucide-react';
import type { ExperienceData, TransportMode } from '@/lib/schemas';
import { formatDateRange } from '@/utils/dateFormatters';
import { formatMoney } from '@/utils/formatCurrency';
import { buildBookingUrl, calculatePricingForPeople } from '@/utils/helpers';
import { PrimaryCtaButton } from '@/components/ui/Button/PrimaryCtaButton';
import { GlassCard } from '@/components/ui/GlassCard/GlassCard';
import { Select } from '@/components/ui/Select/Select';
import {
  useDetailSelectedDate,
  useDetailPeopleCount,
  useDetailTransport,
  useDetailSelectedTierData,
  useDetailSelectedTier,
} from '@/hooks/experiences/useExperienceDetailContext';

interface ExpericeWidgetProps {
  experienceData: ExperienceData;
}

function ExpericeWidgetComponent({
  experienceData,
}: ExpericeWidgetProps) {
  const widgetId = useId();
  const locale = useLocale();
  const { selectedDateId, setDate } = useDetailSelectedDate();
  const { peopleCount, setPeopleCount } = useDetailPeopleCount();
  const { transportMode, setTransportMode } = useDetailTransport();
  const { selectedTierId } = useDetailSelectedTier();
  const selectedTierData = useDetailSelectedTierData();
  const { config, availableDates, transportOptions, whatsappLink, widgetContent } = experienceData;
  const pathname = usePathname();

  const roundtripConfig = selectedTierData?.roundtripTransfer ?? null;

  const bookingHref = useMemo(
    () =>
      buildBookingUrl(`${pathname}/booking`, {
        tier: selectedTierId,
        date: selectedDateId,
        people: peopleCount,
        transport: transportMode,
      }),
    [pathname, selectedTierId, selectedDateId, peopleCount, transportMode],
  );

  const nextDateLabel = useMemo(() => {
    const firstAvailableDate = availableDates.find((date) => date.isAvailable);

    if (!firstAvailableDate) {
      return widgetContent?.fallbackDateLabel ?? 'Available Dates';
    }

    return formatDateRange(firstAvailableDate.startDate, firstAvailableDate.endDate, locale);
  }, [availableDates, locale, widgetContent?.fallbackDateLabel]);

  const formattedPrice = useMemo(() => {
    const { total } = calculatePricingForPeople(
      config.experiencePricePerPerson,
      config.depositPercent,
      experienceData.roomModes,
      peopleCount,
      selectedTierId,
      transportMode,
      roundtripConfig,
    );

    return formatMoney(total, locale, config.currency);
  }, [config, experienceData.roomModes, peopleCount, selectedTierId, locale, transportMode, roundtripConfig]);

  // Theme handled in CSS (`dark:` keyed to data-theme): the card sits on the hero photo in both themes.
  const bodyTextClass = 'text-base-content/80';
  const mutedTextClass = 'text-base-content/70';

  return (
    <>
      <GlassCard variant="auto" className="relative rounded-2xl p-4 md:p-8">
        {/* Dark only: the glass alone is too thin over a bright hero photo. */}
        <div className="pointer-events-none absolute inset-0 hidden rounded-[inherit] bg-slate-950/35 dark:block" aria-hidden="true" />

        <div className="relative z-10 space-y-4 md:space-y-5">
          <div>
            <p className="text-[1.625rem] font-extrabold leading-tight text-base-content md:text-3xl">
              {widgetContent?.fromLabel ? (
                <span className={`mr-1 text-sm font-normal md:text-base ${mutedTextClass}`}>
                  {widgetContent.fromLabel}
                </span>
              ) : null}
              {formattedPrice}
              <span className={`ml-1 text-xs font-normal ${mutedTextClass}`}>
                {peopleCount > 1 ? widgetContent?.totalLabel : widgetContent?.perPersonLabel}
              </span>
            </p>
            {widgetContent?.reviewsCountLabel && (
              <div className="mt-1 flex items-center">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      size={14}
                      fill="currentColor"
                      stroke="currentColor"
                      className="text-primary"
                    />
                  ))}
                </div>
                <span className={`ml-2 text-xs ${mutedTextClass}`}>
                  {widgetContent.reviewsCountLabel}
                </span>
              </div>
            )}
            <p className={`text-sm ${bodyTextClass}`}>{widgetContent?.onSelectedDatesLabel}</p>
          </div>

          <div className="space-y-1">
            <label htmlFor={`${widgetId}-date`} className="text-sm font-medium text-base-content/90">
              {widgetContent?.selectDateLabel}
            </label>
            <Select
              id={`${widgetId}-date`}
              aria-labelledby={`${widgetId}-date`}
              options={[
                { value: '', label: nextDateLabel },
                ...availableDates
                  .filter((date) => date.isAvailable)
                  .map((date) => ({
                    value: date.id,
                    label: formatDateRange(date.startDate, date.endDate, locale),
                  })),
              ]}
              value={selectedDateId ?? ''}
              onChange={(v) => setDate(String(v))}
            />
          </div>

          <div className="grid grid-cols-1 gap-1.5 sm:gap-2 md:gap-3">
            <div className="space-y-1">
              <label htmlFor={`${widgetId}-people`} className="text-sm font-medium text-base-content/90">{widgetContent?.peopleLabel}</label>
              <Select
                id={`${widgetId}-people`}
                aria-labelledby={`${widgetId}-people`}
                options={Array.from({ length: config.maxPeople - config.minPeople + 1 }).map((_, idx) => {
                  const v = config.minPeople + idx;
                  return { value: v, label: String(v) };
                })}
                value={peopleCount}
                onChange={(v) => setPeopleCount(Number(v))}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor={`${widgetId}-transport`} className="text-sm font-medium text-base-content/90">{widgetContent?.howToArriveLabel}</label>
            <Select
              id={`${widgetId}-transport`}
              aria-labelledby={`${widgetId}-transport`}
              aria-describedby={`${widgetId}-transport-note`}
              options={transportOptions.map((t) => ({ value: t.value, label: t.label }))}
              value={transportMode ?? ''}
              onChange={(v) => { if (v) setTransportMode(v as TransportMode); }}
            />
            <p id={`${widgetId}-transport-note`} className={`text-xs leading-snug ${bodyTextClass}`}>
              {widgetContent?.transportNoteLabel}
            </p>
          </div>

          <PrimaryCtaButton href={bookingHref} size="lg" className="w-full py-3 md:py-4">
            <span className="inline-flex items-center gap-2">
              {widgetContent?.bookingButtonLabel}
              <ArrowRight size={18} className="flex-shrink-0" />
            </span>
          </PrimaryCtaButton>

          <div className={`flex flex-col gap-1 text-sm ${bodyTextClass}`}>
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-primary" />
              <span>{widgetContent?.securityLine}</span>
            </div>
            <div className="flex items-center gap-2">
              <Undo2 size={14} className="text-primary" />
              <span>{widgetContent?.freeCancellationLine}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star size={14} className="text-primary" />
              <span>{widgetContent?.verifiedReviewsLine}</span>
            </div>
          </div>
        </div>
      </GlassCard>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-outline mt-3 h-auto min-h-12 w-full gap-2 border-zinc-300 bg-white text-base-content hover:bg-zinc-100 md:mt-4 dark:border-white/40 dark:bg-slate-900/40 dark:text-white dark:hover:bg-slate-900/60"
      >
        <MessageCircle size={18} className="flex-shrink-0" />
        {widgetContent?.whatsappCtaLabel}
      </a>
    </>
  );
}

ExpericeWidgetComponent.displayName = 'ExpericeWidget';

export default memo(ExpericeWidgetComponent);
