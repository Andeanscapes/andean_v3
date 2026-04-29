'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card/Card';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useReservationTransport } from '@/hooks/experiences/useReservationContext';
import { EXPERIENCE_ICON_MAP } from '@/utils/experienceIconMap';
import { ItineraryModal } from './ItineraryModal';
import type { ExperienceData } from '@/lib/schemas';

interface IncludesAccordionProps {
  experienceData: ExperienceData;
}

export function IncludesAccordion({ experienceData }: IncludesAccordionProps) {
  const t = useTranslations('experiences.ui');
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { transportMode } = useReservationTransport();

  // Use pre-translated inclusionsContent from the service layer
  const { inclusionsContent, transportOptions } = experienceData;
  const included = inclusionsContent?.included ?? [];

  // Override the transport logistics item value with the user's actual selection
  const logistics = useMemo(() => {
    const base = inclusionsContent?.logistics ?? [];
    if (!transportMode || !transportOptions) return base;
    const selectedOption = transportOptions.find((o) => o.value === transportMode);
    if (!selectedOption) return base;
    return base.map((item) =>
      item.id === 'transport' ? { ...item, value: selectedOption.label } : item
    );
  }, [inclusionsContent?.logistics, transportMode, transportOptions]);

  if (logistics.length === 0 && included.length === 0) return null;

  // Match exact card classes used by DateSelector, ContactFields, etc.
  const logisticsCardClass = isDark
    ? 'mb-3 border border-white/15 bg-slate-900/45 backdrop-blur-xl'
    : 'mb-3 border border-neutral-200 bg-white/95 shadow-[0_20px_50px_rgba(0,0,0,0.18)]';

  const includedCardClass = isDark
    ? 'mb-6 border border-white/15 bg-slate-900/45 backdrop-blur-xl'
    : 'mb-6 border border-neutral-200 bg-white/95 shadow-[0_20px_50px_rgba(0,0,0,0.18)]';

  const logisticsLabelClass = isDark
    ? 'text-xs font-medium text-white/55 mb-0.5'
    : 'text-xs font-medium text-neutral-500 mb-0.5';

  const logisticsValueClass = isDark
    ? 'text-sm font-bold text-emerald-400'
    : 'text-sm font-bold text-emerald-600';

  const logisticsIconClass = isDark ? 'text-emerald-400' : 'text-emerald-600';

  const logisticsSectionLabelClass = isDark
    ? 'text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4'
    : 'text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4';

  const includedTitleClass = isDark
    ? 'text-xs font-bold uppercase tracking-widest text-emerald-400'
    : 'text-xs font-bold uppercase tracking-widest text-emerald-700';

  const includedItemClass = isDark
    ? 'text-sm text-emerald-100/85'
    : 'text-sm text-neutral-700';

  return (
    <>
      {/* ── Logistics Grid ── theme-aware */}
      {logistics.length > 0 && (
        <Card className={logisticsCardClass}>
          <p className={logisticsSectionLabelClass}>
            {t('tripLogistics')}
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            {logistics.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className={`mt-0.5 flex-shrink-0 ${logisticsIconClass}`}>
                  {EXPERIENCE_ICON_MAP[item.icon] ?? <Clock className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <p className={logisticsLabelClass}>{item.label}</p>
                  {item.value ? (
                    <p className={logisticsValueClass}>{item.value}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Included Items ── theme-aware */}
      {included.length > 0 && (
        <Card className={includedCardClass}>
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <p className={includedTitleClass}>{t('whatIsIncluded')}</p>
          </div>
          <ul className="space-y-2.5">
            {included.map((item) => (
              <li key={item.id} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                <span className={includedItemClass}>{item.title}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            {t('viewFullDetails')}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </Card>
      )}

      <ItineraryModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        experienceData={experienceData}
      />
    </>
  );
}
