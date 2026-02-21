'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { useReservationDate } from '@/hooks/experiences/useReservationContext';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { formatAvailableDates } from '@/lib/experiences/dateFormatters';
import type { AvailableDate } from '@/lib/experiences/types';

interface DateSelectorProps {
  availableDates: AvailableDate[];
}

export function DateSelector({ availableDates }: DateSelectorProps) {
  const t = useTranslations('experiences.ui');
  const { selectedDateId, selectedDateLabel, setDate } = useReservationDate();
  const { currentLocale } = useLanguageContext();

  // Format dates based on user's locale
  const formattedDates = useMemo(
    () => formatAvailableDates(availableDates, currentLocale),
    [availableDates, currentLocale]
  );

  // Filter only available dates
  const availableOnly = useMemo(
    () => formattedDates.filter((date) => date.isAvailable),
    [formattedDates]
  );
  const showScrollHint = availableOnly.length > 6;

  return (
    <Card id="available-dates" className="mb-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <h2 className="text-xl font-semibold text-base-content">
          {t('availableDates')}
        </h2>
        {selectedDateLabel && (
          <p className="text-xs text-base-content/75">
            {t('selectedDateLabel')}: {selectedDateLabel}
          </p>
        )}
      </div>
      <div className="relative">
        <div className="max-h-64 overflow-y-auto pr-1 pb-3 pt-3 space-y-2">
          {availableOnly.map((date) => (
            <Badge
              key={date.id}
              selected={selectedDateId === date.id}
              onClick={() => setDate(date.id, date.label, date.spots)}
              className={`w-full text-left justify-between border shadow-sm transition hover:shadow-md hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 ${
                selectedDateId === date.id
                  ? 'bg-primary/10 border-primary ring-2 ring-primary/50 text-base-content font-semibold shadow-md'
                  : 'bg-base-200/50 border-base-300/60 text-base-content/90'
              }`}
              variant="primary"
            >
              <span>{date.label}</span>
              <span className="text-xs opacity-80 flex items-center gap-2">
                {selectedDateId === date.id && (
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                )}
                <span>({t('spotsAvailable', { count: date.spots })})</span>
              </span>
            </Badge>
          ))}
        </div>
        {showScrollHint && (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-base-100 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-base-100 to-transparent" />
          </>
        )}
      </div>
      {showScrollHint && (
        <p className="mt-2 text-[11px] text-base-content/60">
          {t('scrollHint')}
        </p>
      )}
      <p className="text-[11px] text-base-content/60 mt-4">
        {t('controlledDatesNote')}
      </p>
    </Card>
  );
}
