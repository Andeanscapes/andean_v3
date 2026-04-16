'use client';

import { memo, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { useReservationDate } from '@/hooks/experiences/useReservationContext';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import { formatAvailableDates } from '@/utils/dateFormatters';
import type { AvailableDate } from '@/lib/schemas';

interface DateSelectorProps {
  availableDates: AvailableDate[];
}

function DateSelectorComponent({ availableDates }: DateSelectorProps) {
  const t = useTranslations('experiences.ui');
  const { selectedDateId, selectedDateLabel, setDate } = useReservationDate();
  const { currentLocale } = useLanguageContext();
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  const cardClass = isDark
    ? 'mb-6 border border-white/15 bg-slate-900/45 backdrop-blur-xl'
    : 'mb-6 border border-neutral-200 bg-white/95 shadow-[0_20px_50px_rgba(0,0,0,0.18)]';

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
    <Card id="available-dates" className={cardClass}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <h2 className="text-xl font-semibold text-base-content">
          {t('availableDates')}
        </h2>
        {selectedDateLabel && (
          <p className="text-xs text-primary/90">
            {t('selectedDateLabel')}: {selectedDateLabel}
          </p>
        )}
      </div>
      <div className="relative">
        <div className="max-h-64 overflow-y-auto pr-1 pb-3 pt-3 space-y-2">
          {availableOnly.map((date) => {
            const isSelected = selectedDateId === date.id;
            const isLowAvailability = date.spots > 0 && date.spots < 3;
            return (
              <Badge
                key={date.id}
                selected={isSelected}
                onClick={() => setDate(date.id, date.label, date.spots)}
                className={`w-full text-left justify-between border shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 ${
                  isSelected
                    ? 'bg-primary/10 border-primary ring-2 ring-primary/50 text-base-content font-semibold shadow-md scale-[1.02] shadow-[0_0_15px_rgba(0,168,107,0.3)]'
                    : 'bg-base-200/50 border-base-300/60 text-base-content/90'
                }`}
                variant="primary"
              >
                <span className="flex items-center gap-2">
                  <span>{date.label}</span>
                  {isLowAvailability && (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                      {t('lowAvailability')}
                    </span>
                  )}
                </span>
                <span className="text-xs opacity-80 flex items-center gap-2">
                  {isSelected && (
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
            );
          })}
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

export const DateSelector = memo(DateSelectorComponent);
