'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card/Card';
import { RadioGroup } from '@/components/ui/RadioGroup/RadioGroup';
import {
  useReservationTransport,
  useReservationTier,
  useReservationRooms,
  useReservationAccommodationTiers,
} from '@/hooks/experiences/useReservationContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useLanguageContext } from '@/contexts/LanguageContext';
import type { TransportMode, TransportOption } from '@/lib/schemas';

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
  const { selectedTierId } = useReservationTier();
  const { peopleCount } = useReservationRooms();
  const tiersContent = useReservationAccommodationTiers();
  const { theme } = useThemeContext();
  const { currentLocale } = useLanguageContext();
  const isDark = theme === 'dark';

  const localeMap: Record<string, string> = {
    en: 'en-US',
    es: 'es-CO',
    fr: 'fr-FR',
  };

  const roundtripConfig = useMemo(() => {
    if (!selectedTierId || !tiersContent) return null;
    return tiersContent.tiers.find((tier) => tier.id === selectedTierId)?.roundtripTransfer ?? null;
  }, [selectedTierId, tiersContent]);

  const formatPrice = (price: number) => {
    const locale = localeMap[currentLocale] ?? 'es-CO';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const cardClass = isDark
    ? 'mb-6 border border-white/15 bg-slate-900/45 backdrop-blur-xl'
    : 'mb-6 border border-neutral-200 bg-white/95 shadow-[0_20px_50px_rgba(0,0,0,0.18)]';

  const radioOptions = useMemo(() => {
    return transportOptions.map((opt) => {
      if (opt.value === 'roundtrip_transfer' && roundtripConfig) {
        const vehicleCount = Math.ceil(Math.max(peopleCount, 1) / roundtripConfig.maxPeoplePerVehicle);
        const totalCost = vehicleCount * roundtripConfig.pricePerVehicle;
        const priceLabel = formatPrice(roundtripConfig.pricePerVehicle);
        const totalLabel = formatPrice(totalCost);

        const description = (
          <span className="space-y-0.5 block">
            <span className="block">{opt.description}</span>
            <span className={`block text-xs font-medium ${isDark ? 'text-[#00F08F]/80' : 'text-emerald-700'}`}>
              {t('roundtripTransferVehicles', { count: vehicleCount })} × {priceLabel} = {totalLabel}
            </span>
          </span>
        );

        return {
          value: opt.value,
          label: (
            <span className="inline-flex items-center gap-2 flex-wrap">
              <span>{opt.label}</span>
              <span className={`text-xs ${isDark ? 'text-base-content/60' : 'text-neutral-500'}`}>
                ({roundtripConfig.origin} ↔ {roundtripConfig.destination})
              </span>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${isDark ? 'bg-[#00F08F]/15 text-[#00F08F]' : 'bg-emerald-100 text-emerald-800'}`}>
                {priceLabel}/{t('roundtripTransferPerVehicle')}
              </span>
            </span>
          ),
          description,
        };
      }
      return {
        value: opt.value,
        label: opt.label,
        description: opt.description,
      };
    });
  }, [transportOptions, roundtripConfig, peopleCount, isDark, currentLocale, t]);

  return (
    <Card className={cardClass}>
      <h2 className="text-xl font-semibold mb-4 text-base-content leading-snug pr-2">
        {title || t('startingPoint')}
      </h2>
      <RadioGroup
        name="transport"
        options={radioOptions}
        value={transportMode}
        onChange={(mode) => setTransportMode(mode as TransportMode)}
        label={t('howToArrive')}
        orientation="vertical"
      />
    </Card>
  );
}
