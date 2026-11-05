'use client';

import { memo, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card/Card';
import { useReservationDate } from '@/hooks/experiences/useReservationContext';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { formatAvailableDates } from '@/utils/dateFormatters';
import type { AvailableDate } from '@/lib/schemas';

interface DateSelectorProps {
  availableDates: AvailableDate[];
  /** Explains why a date from a shared link is not preselected. */
  sharedDateUnavailable?: boolean;
}

function DateSelectorComponent({ availableDates, sharedDateUnavailable = false }: DateSelectorProps) {
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
    <Card id="available-dates" padding="responsive" className="mb-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <h2 className="text-md sm:text-2md md:text-xl font-semibold text-base-content">
          {t('availableDates')}
        </h2>
        {selectedDateLabel && (
          <p className="text-xs font-medium text-primary">
            {t('selectedDateLabel')}: {selectedDateLabel}
          </p>
        )}
      </div>
      {sharedDateUnavailable && !selectedDateId && (
        <p
          role="status"
          className="mb-4 rounded-xl border border-amber-300/70 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-900/20 dark:text-amber-200"
        >
          {t('sharedDateUnavailable')}
        </p>
      )}
      <div className="relative">
        <div className="max-h-64 overflow-y-auto -mx-1.5 px-2.5 py-1.5 space-y-2">
          {availableOnly.map((date) => {
            const isSelected = selectedDateId === date.id;
            const isLowAvailability = date.spots > 0 && date.spots < 3;
            return (
              <button
                key={date.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setDate(date.id, date.label, date.spots)}
                className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary font-semibold text-base-content dark:bg-primary/10'
                    : 'border-zinc-200/80 bg-white text-base-content/80 hover:border-primary/40 dark:border-white/10 dark:bg-slate-900/40'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{date.label}</span>
                  {isLowAvailability && (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-400">
                      {t('lowAvailability')}
                    </span>
                  )}
                </span>
                <span className="text-xs font-normal text-base-content/70 flex items-center gap-2">
                  {isSelected && (
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary/15 text-primary">
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
              </button>
            );
          })}
        </div>
        {showScrollHint && (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-white to-transparent dark:from-base-100" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white to-transparent dark:from-base-100" />
          </>
        )}
      </div>
      {showScrollHint && (
        <p className="mt-2 text-[11px] text-base-content/70">
          {t('scrollHint')}
        </p>
      )}
      <p className="text-[11px] text-base-content/70 mt-4">
        {t('controlledDatesNote')}
      </p>
    </Card>
  );
}

export const DateSelector = memo(DateSelectorComponent);
