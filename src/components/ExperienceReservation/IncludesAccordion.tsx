'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card/Card';
import { Accordion } from '@/components/ui/Accordion/Accordion';
import { useThemeContext } from '@/contexts/ThemeContext';
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

  const cardClass = isDark
    ? 'mb-6 border border-white/15 bg-slate-900/45 backdrop-blur-xl'
    : 'mb-6 border border-neutral-200 bg-white/95 shadow-[0_20px_50px_rgba(0,0,0,0.18)]';

  const accordionItems = [
    {
      id: 'includes',
      title: t('whatIsIncluded'),
      content: (
        <div className="space-y-2">
          <ul className="list-disc list-inside space-y-1 text-sm text-base-content/90">
            {experienceData.config.includesItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <button
            type="button"
            className="btn btn-link btn-sm mt-3 text-primary hover:text-primary/90"
            onClick={() => setIsModalOpen(true)}
          >
            {t('viewFullDetails')}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card className={cardClass}>
        <Accordion
          items={accordionItems}
          defaultOpen={['includes']}
          allowMultiple={false}
        />
      </Card>
      <ItineraryModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        experienceData={experienceData}
      />
    </>
  );
}
