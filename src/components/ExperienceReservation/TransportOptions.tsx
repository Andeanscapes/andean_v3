'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card/Card';
import { RadioGroup } from '@/components/ui/RadioGroup/RadioGroup';
import {
  useReservationTransport,
  useReservationTier,
  useReservationRooms,
  useReservationAccommodationTiers,
  useReservationCurrency,
} from '@/hooks/experiences/useReservationContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { formatMoney } from '@/utils/formatCurrency';
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
  const currency = useReservationCurrency();
  const { theme } = useThemeContext();
  const { currentLocale } = useLanguageContext();
  const isDark = theme === 'dark';
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const roundtripConfig = useMemo(() => {
    if (!selectedTierId || !tiersContent) return null;
    return tiersContent.tiers.find((tier) => tier.id === selectedTierId)?.roundtripTransfer ?? null;
  }, [selectedTierId, tiersContent]);

  const formatPrice = (price: number) => formatMoney(price, currentLocale, currency);

  const cardClass = `transition-all duration-300 ${isDark
    ? 'mb-6 border border-white/15 bg-slate-900/45 backdrop-blur-2xl'
    : 'mb-6 border border-neutral-200 bg-white/95 shadow-[0_20px_50px_rgba(0,0,0,0.18)]'} ${
    transportMode ? 'shadow-[0_0_20px_rgba(0,168,107,0.2)]' : ''
  }`;

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

      if (opt.value === 'car_no_4x4') {
        return {
          value: opt.value,
          label: (
            <span className="inline-flex items-center gap-2 flex-wrap">
              <span>{opt.label}</span>
              <span className="relative inline-flex">
                <button
                  type="button"
                  aria-label={t('transportTooltipCarNo4x4')}
                  onClick={(e) => { e.preventDefault(); setTooltipOpen((v) => !v); }}
                  onBlur={() => setTooltipOpen(false)}
                  className="inline-flex h-[18px] w-[18px] items-center justify-center text-amber-500 hover:text-amber-600 focus-visible:ring-2 focus-visible:ring-amber-500/60 rounded-full dark:text-amber-400 dark:hover:text-amber-300"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-1 4a1 1 0 0 1 2 0v5a1 1 0 0 1-2 0v-5z"/>
                  </svg>
                </button>
                {tooltipOpen && (
                  <span
                    role="tooltip"
                    className={`absolute left-6 top-0 z-20 w-60 rounded-lg border p-2.5 text-[11px] leading-relaxed shadow-lg ${
                      isDark
                        ? 'border-white/10 bg-slate-800 text-base-content/90'
                        : 'border-amber-200 bg-amber-50 text-amber-900'
                    }`}
                  >
                    {t('transportTooltipCarNo4x4')}
                  </span>
                )}
              </span>
            </span>
          ),
          description: opt.description,
        };
      }

      return {
        value: opt.value,
        label: opt.label,
        description: opt.description,
      };
    });
  }, [transportOptions, roundtripConfig, peopleCount, isDark, currentLocale, t, tooltipOpen]);

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
