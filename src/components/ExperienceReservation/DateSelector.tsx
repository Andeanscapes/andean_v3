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
  const { selectedDateId, setDate } = useReservationDate();
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

  return (
    <Card className="mb-6">
      <h2 className="text-xl font-semibold mb-4 text-base-content">{t('availableDates')}</h2>
      <div className="space-y-2">
        {availableOnly.map((date) => (
          <Badge
            key={date.id}
            selected={selectedDateId === date.id}
            onClick={() => setDate(date.id, date.label, date.spots)}
            className={`w-full text-left justify-between border shadow-sm transition hover:shadow-md hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 ${
              selectedDateId === date.id
                ? 'bg-primary/10 border-primary ring-2 ring-primary/50 text-base-content font-semibold'
                : 'bg-base-200/50 border-base-300/60 text-base-content/90'
            }`}
            variant="primary"
          >
            <span>{date.label}</span>
            <span className="text-xs opacity-80">
              ({t('spotsAvailable', { count: date.spots })})
            </span>
          </Badge>
        ))}
      </div>
      <p className="text-xs text-base-content/85 mt-4">
        {t('controlledDatesNote')}
      </p>
    </Card>
  );
}
