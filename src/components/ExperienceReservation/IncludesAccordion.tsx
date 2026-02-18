'use client';

import { Card } from '@/components/ui/Card/Card';
import { Accordion } from '@/components/ui/Accordion/Accordion';
import type { ExperienceConfig } from '@/lib/experiences/types';

interface IncludesAccordionProps {
  config: ExperienceConfig;
}

export function IncludesAccordion({ config }: IncludesAccordionProps) {
  const accordionItems = [
    {
      id: 'includes',
      title: '¿Qué incluye?',
      content: (
        <div className="space-y-2">
          <ul className="list-disc list-inside space-y-1 text-sm text-base-content/90">
            {config.includesItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <button className="btn btn-link btn-sm mt-3 text-primary hover:text-primary/90">
            Ver detalles completos
          </button>
        </div>
      ),
    },
  ];

  return (
    <Card className="mb-6">
      <Accordion
        items={accordionItems}
        defaultOpen={['includes']}
        allowMultiple={false}
      />
    </Card>
  );
}
