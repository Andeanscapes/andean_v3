'use client';

import { memo, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card/Card';
import { Select } from '@/components/ui/Select/Select';
import { useReservationPeopleCount } from '@/hooks/experiences/useReservationContext';

interface PeopleSelectorProps {
  maxPeople?: number;
  minPeople?: number;
}

function PeopleSelectorComponent({
  maxPeople = 4,
  minPeople = 1,
}: PeopleSelectorProps) {
  const t = useTranslations('experiences.ui');
  const { peopleCount, setPeopleCount } = useReservationPeopleCount();

  const options = useMemo(
    () =>
      Array.from({ length: maxPeople - minPeople + 1 }, (_, idx) => {
        const v = minPeople + idx;
        return { value: v, label: String(v) };
      }),
    [maxPeople, minPeople]
  );

  const triggerClass =
    'flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-base-content transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 dark:border-white/20 dark:bg-slate-900';

  const panelClass =
    'absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:border-white/15 dark:bg-slate-900 dark:shadow-[0_8px_32px_rgba(0,0,0,0.55)]';

  const optionClass =
    'flex min-h-11 cursor-pointer select-none items-center px-3 py-2.5 text-sm text-base-content/80 transition-colors border-t border-zinc-200 first:border-t-0 dark:border-white/8';

  const optionHoverClass =
    'hover:bg-emerald-50 hover:text-emerald-900 dark:hover:bg-white/10 dark:hover:text-white';

  const effectiveValue = peopleCount >= minPeople && peopleCount <= maxPeople ? peopleCount : minPeople;

  return (
    <Card padding="responsive" className="relative z-10 mb-6">
      <div className="mb-4">
        <h2 className="text-md sm:text-2md md:text-xl font-semibold text-base-content">{t('howManyPeople')}</h2>
      </div>
      <Select
        id="people-selector"
        options={options}
        value={effectiveValue}
        onChange={(v) => setPeopleCount(Number(v))}
        triggerClassName={triggerClass}
        panelClassName={panelClass}
        optionClassName={optionClass}
        optionHoverClassName={optionHoverClass}
        aria-label={t('howManyPeople')}
      />
    </Card>
  );
}

export const PeopleSelector = memo(PeopleSelectorComponent);
