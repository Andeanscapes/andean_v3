'use client';

import { memo, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card/Card';
import { Select } from '@/components/ui/Select/Select';
import { useReservationPeopleCount } from '@/hooks/experiences/useReservationContext';
import { useThemeContext } from '@/contexts/ThemeContext';

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
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  const options = useMemo(
    () =>
      Array.from({ length: maxPeople - minPeople + 1 }, (_, idx) => {
        const v = minPeople + idx;
        return { value: v, label: String(v) };
      }),
    [maxPeople, minPeople]
  );

  const cardClass = isDark
    ? 'relative z-10 mb-6 border border-white/15 bg-slate-900/45 backdrop-blur-xl'
    : 'relative z-10 mb-6 border border-neutral-200 bg-white/95 shadow-[0_20px_50px_rgba(0,0,0,0.18)]';

  const triggerClass = isDark
    ? 'flex w-full items-center justify-between gap-2 rounded-lg border border-white/20 bg-slate-900 px-3 py-2.5 text-sm text-base-content transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60'
    : 'flex w-full items-center justify-between gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60';

  const panelClass = isDark
    ? 'absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-white/15 bg-slate-900 shadow-[0_8px_32px_rgba(0,0,0,0.55)]'
    : 'absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)]';

  const optionClass = isDark
    ? 'flex cursor-pointer select-none items-center px-3 py-2.5 text-sm text-base-content/90 transition-colors border-t border-white/8 first:border-t-0'
    : 'flex cursor-pointer select-none items-center px-3 py-2.5 text-sm text-neutral-800 transition-colors border-t border-neutral-200 first:border-t-0';

  const optionHoverClass = isDark
    ? 'hover:bg-white/10 hover:text-white'
    : 'hover:bg-emerald-50 hover:text-emerald-900';

  const effectiveValue = peopleCount >= minPeople && peopleCount <= maxPeople ? peopleCount : minPeople;

  return (
    <Card className={cardClass}>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{t('howManyPeople')}</h2>
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
