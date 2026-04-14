'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card/Card';
import {
  useReservationPricing,
  useReservationTier,
  useReservationAccommodationTiers,
} from '@/hooks/experiences/useReservationContext';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { useThemeContext } from '@/contexts/ThemeContext';

interface PriceSummaryProps {
  depositPercent?: number;
}

export function PriceSummary({ depositPercent = 15 }: PriceSummaryProps) {
  const { total, depositAmount, roundtripTransferCost } = useReservationPricing();
  const { selectedTierId } = useReservationTier();
  const tiersContent = useReservationAccommodationTiers();
  const t = useTranslations('experiences.ui');
  const { currentLocale } = useLanguageContext();
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  const selectedTier = tiersContent?.tiers.find((t) => t.id === selectedTierId);
  const roundtripConfig = selectedTier?.roundtripTransfer ?? null;

  const cardClass = isDark
    ? 'mb-6 border-2 border-[#00F08F]/20 bg-slate-900/50 backdrop-blur-xl'
    : 'mb-6 border-2 border-emerald-200 bg-white/95 shadow-[0_20px_50px_rgba(0,0,0,0.18)]';

  const localeMap: Record<string, string> = {
    en: 'en-US',
    es: 'es-CO',
    fr: 'fr-FR',
  };

  const formatPrice = (price: number) => {
    const locale = localeMap[currentLocale] ?? 'es-CO';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className={cardClass}>
      <div className="space-y-2">
        {selectedTier && (
          <div className={`flex items-center gap-2 mb-2 pb-2 border-b ${isDark ? 'border-white/10' : 'border-neutral-200'}`}>
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md">
              <img src={selectedTier.images.main} alt={selectedTier.tierLabel} className="h-full w-full object-cover" loading="lazy" decoding="async" />
            </div>
            <span className={`text-sm font-medium ${isDark ? 'text-base-content/80' : 'text-neutral-700'}`}>
              {selectedTier.tierLabel}
            </span>
          </div>
        )}
        {roundtripTransferCost > 0 && roundtripConfig && (
          <div className={`flex justify-between items-center text-sm py-1.5 ${isDark ? 'text-base-content/70' : 'text-neutral-600'}`}>
            <span className="flex items-center gap-1.5">
              🚐 {t('roundtripTransferLineItem', { origin: roundtripConfig.origin, destination: roundtripConfig.destination })}
            </span>
            <span className="font-medium">
              {formatPrice(roundtripTransferCost)}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="font-semibold text-base-content">
            {t('totalLabel')}:
          </span>
          <span className="text-lg font-bold text-base-content">
            {formatPrice(total)}
          </span>
        </div>
        <div className="divider my-2"></div>
        <div className="flex justify-between items-center bg-primary/5 -mx-4 px-4 py-2 rounded-lg">
          <span className="text-sm font-semibold text-base-content">
            {t('payTodayLabel')} ({depositPercent}%):
          </span>
          <span className="text-xl font-bold text-primary">
            {formatPrice(depositAmount)}
          </span>
        </div>
        <p className="text-xs text-primary/90 mt-3">
          💰 {t('balanceNote')}
        </p>
      </div>
    </Card>
  );
}
