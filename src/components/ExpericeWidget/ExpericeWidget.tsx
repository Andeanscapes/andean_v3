'use client';

import { useMemo } from 'react';
import { useLocale } from 'next-intl';
import { MessageCircle } from 'lucide-react';
import type { ExperienceData } from '@/lib/schemas';
import { formatDateRange } from '@/utils/dateFormatters';
import { Button } from '@/components/ui/Button/Button';
import { Card } from '@/components/ui/Card/Card';

interface ExpericeWidgetProps {
  experienceData: ExperienceData;
}

export default function ExpericeWidget({
  experienceData,
}: ExpericeWidgetProps) {
  const locale = useLocale();
  const { config, availableDates, roomModes, transportOptions, whatsappLink, widgetContent } = experienceData;

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
        className="border-white/20 bg-base-100/10 backdrop-blur-md md:p-6"
      >
        <div className="space-y-4">
          <div>
            <p className="text-3xl font-bold text-base-content">{formattedPrice}</p>
            <p className="text-sm text-base-content/70">{widgetContent?.onSelectedDatesLabel}</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-base-content/90">
              {widgetContent?.selectDateLabel}
            </label>
            <select className="select select-bordered w-full bg-base-100/95 text-base-content">
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-base-content/90">{widgetContent?.peopleLabel}</label>
              <select className="select select-bordered w-full bg-base-100/95 text-base-content">
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

            <div className="space-y-1">
              <label className="text-sm font-medium text-base-content/90">{widgetContent?.roomTypeLabel}</label>
              <select className="select select-bordered w-full bg-base-100/95 text-base-content">
                {roomModes.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-base-content/90">{widgetContent?.howToArriveLabel}</label>
            <select className="select select-bordered w-full bg-base-100/95 text-base-content">
              {transportOptions.map((transport) => (
                <option key={transport.value} value={transport.value}>
                  {transport.label}
                </option>
              ))}
            </select>
          </div>

          <Button size="lg" className="w-full border-0 bg-success text-success-content hover:bg-success/90">
            {widgetContent?.checkDatesButtonLabel}
          </Button>

          <ul className="space-y-1 text-sm text-base-content/70">
            <li>{widgetContent?.securityLine}</li>
            <li>{widgetContent?.freeCancellationLine}</li>
            <li>{widgetContent?.verifiedReviewsLine}</li>
          </ul>
        </div>
      </Card>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-outline mt-4 w-full gap-2 h-auto min-h-12 hover:bg-base-200 dark:border-white/40 dark:bg-base-100/10 dark:text-white dark:hover:bg-base-100/20"
      >
        <MessageCircle size={18} className="flex-shrink-0" />
        {widgetContent?.whatsappCtaLabel}
      </a>
    </>
  );
}