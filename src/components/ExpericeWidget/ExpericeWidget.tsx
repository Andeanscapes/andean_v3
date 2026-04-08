'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
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
  const t = useTranslations();
  const locale = useLocale();
  const { config, availableDates, roomModes, transportOptions, whatsappLink } = experienceData;

  const nextDateLabel = useMemo(() => {
    const firstAvailableDate = availableDates.find((date) => date.isAvailable);

    if (!firstAvailableDate) {
      return t('experiences.ui.availableDates');
    }

    return formatDateRange(firstAvailableDate.startDate, firstAvailableDate.endDate, locale);
  }, [availableDates, locale, t]);

  return (
    <>
      <Card
        padding="md"
        className="border-white/20 bg-base-100/10 backdrop-blur-md md:p-6"
      >
        <div className="space-y-4">
          <div>
            <p className="text-3xl font-bold text-white">${config.basePricePerPerson}</p>
            <p className="text-sm text-white/80">on selected dates</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-white/90">
              {t('experiences.ui.experienceDetails.selectDate')}
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
              <label className="text-sm font-medium text-white/90">{t('experiences.ui.peopleLabel')}</label>
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
              <label className="text-sm font-medium text-white/90">{t('experiences.ui.roomType')}</label>
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
            <label className="text-sm font-medium text-white/90">{t('experiences.ui.howToArrive')}</label>
            <select className="select select-bordered w-full bg-base-100/95 text-base-content">
              {transportOptions.map((transport) => (
                <option key={transport.value} value={transport.value}>
                  {transport.label}
                </option>
              ))}
            </select>
          </div>

          <Button size="lg" className="w-full border-0 bg-success text-success-content hover:bg-success/90">
            {t('experiences.ui.experienceDetails.checkDatesBtn')}
          </Button>

          <ul className="space-y-1 text-sm text-white/90">
            <li>{t('experiences.common.security')}</li>
            <li>Free cancellation</li>
            <li>Verified reviews</li>
          </ul>
        </div>
      </Card>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-outline mt-4 w-full border-white/40 bg-base-100/10 text-white hover:bg-base-100/20"
      >
        {t('BookingCtas.whatsappCta')}
      </a>
    </>
  );
}