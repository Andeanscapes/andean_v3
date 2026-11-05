'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card/Card';
import { useReservationTransport } from '@/hooks/experiences/useReservationContext';
import { EXPERIENCE_ICON_MAP } from '@/utils/experienceIconMap';
import { ItineraryModal } from './ItineraryModal';
import type { ExperienceData } from '@/lib/schemas';

interface IncludesAccordionProps {
  experienceData: ExperienceData;
}

export function IncludesAccordion({ experienceData }: IncludesAccordionProps) {
  const t = useTranslations('experiences.ui');
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

  return (
    <>
      {/* ── Logistics Grid ── theme-aware */}
      {logistics.length > 0 && (
        <Card className="mb-3">
          <p className="mb-4 text-xs font-medium text-base-content/70">
            {t('tripLogistics')}
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            {logistics.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0 text-primary" aria-hidden="true">
                  {EXPERIENCE_ICON_MAP[item.icon] ?? <Clock className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <p className="mb-0.5 text-xs font-medium text-base-content/70">{item.label}</p>
                  {item.value ? (
                    <p className="text-sm font-bold text-primary">{item.value}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Included Items ── theme-aware */}
      {included.length > 0 && (
        <Card className="mb-6">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
            <p className="text-sm font-semibold text-base-content">{t('whatIsIncluded')}</p>
          </div>
          <ul className="space-y-2.5">
            {included.map((item) => (
              <li key={item.id} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
                <span className="text-sm text-base-content/80">{item.title}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-semibold text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            onClick={() => setIsModalOpen(true)}
          >
            {t('viewFullDetails')}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
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
