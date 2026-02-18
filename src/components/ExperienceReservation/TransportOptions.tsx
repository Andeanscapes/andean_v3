'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card/Card';
import { RadioGroup } from '@/components/ui/RadioGroup/RadioGroup';
import { useReservationTransport } from '@/hooks/experiences/useReservationContext';
import type { TransportMode, TransportOption } from '@/lib/experiences/types';

interface TransportOptionsProps {
  transportOptions: TransportOption[];
  title?: string;
}

export function TransportOptions({
  transportOptions,
  title,
}: TransportOptionsProps) {
  const t = useTranslations('experiences.ui');
  const { transportMode, setTransportMode } = useReservationTransport();

  return (
    <Card className="mb-6">
      <h2 className="text-xl font-semibold mb-4 text-base-content leading-snug pr-2">
        {title || t('startingPoint')}
      </h2>
      <RadioGroup
        name="transport"
        options={transportOptions.map((opt) => ({
          value: opt.value,
          label: opt.label,
          description: opt.description,
        }))}
        value={transportMode}
        onChange={(mode) => setTransportMode(mode as TransportMode)}
        label={t('howToArrive')}
        orientation="vertical"
      />
    </Card>
  );
}
