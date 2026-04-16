'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card/Card';
import {
  useReservationPricing,
  useReservationTier,
  useReservationAccommodationTiers,
  useReservationCommunityContribution,
} from '@/hooks/experiences/useReservationContext';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { useThemeContext } from '@/contexts/ThemeContext';

interface PriceSummaryProps {
  depositPercent?: number;
}

export function PriceSummary({ depositPercent = 15 }: PriceSummaryProps) {
  const { total, depositAmount, roundtripTransferCost, communityContributionAmount } = useReservationPricing();
  const { selectedTierId } = useReservationTier();
  const tiersContent = useReservationAccommodationTiers();
  const { communityContributionEnabled } = useReservationCommunityContribution();
  const t = useTranslations('experiences.ui');
  const { currentLocale } = useLanguageContext();
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  const selectedTier = tiersContent?.tiers.find((t) => t.id === selectedTierId);
  const roundtripConfig = selectedTier?.roundtripTransfer ?? null;

  const cardClass = isDark
    ? 'mb-4 border-2 border-[#00F08F]/20 bg-slate-900/50 backdrop-blur-2xl !p-4 lg:!p-6'
    : 'mb-4 border-2 border-emerald-200 bg-white/95 shadow-[0_20px_50px_rgba(0,0,0,0.18)] !p-4 lg:!p-6';

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
              {/* Above-fold LCP candidate — eager load with high fetch priority */}
              <img src={selectedTier.images.thumbnail ?? selectedTier.images.main} alt={selectedTier.tierLabel} className="h-full w-full object-cover" loading="eager" decoding="async" fetchPriority="high" />
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
        {communityContributionEnabled && communityContributionAmount > 0 && (
          <div className={`flex justify-between items-center text-sm py-1.5 ${isDark ? 'text-emerald-400/80' : 'text-emerald-700'}`}>
            <span className="flex items-center gap-1.5">
              🌱 {t('communityContributionImpact')}
            </span>
            <span className="font-medium">
              {formatPrice(communityContributionAmount)}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className={`font-semibold tracking-wide text-base-content`}>
            {t('totalLabel')}:
          </span>
          <span className="text-lg font-bold tracking-wide text-base-content">
            {formatPrice(total)}
          </span>
        </div>
        <div className="divider my-2"></div>
        <div className={`flex justify-between items-center -mx-4 px-4 py-2 rounded-lg ${isDark ? 'bg-primary/5' : 'bg-emerald-50'}`}>
          <span className="text-sm font-semibold text-base-content">
            {t('payTodayLabel')} ({depositPercent}%):
          </span>
          <span className="text-xl font-bold tracking-wide text-primary">
            {formatPrice(depositAmount)}
          </span>
        </div>
        <p className={`text-xs mt-3 ${isDark ? 'text-primary/90' : 'text-[#006B40]'}`}>
          💰 {t('balanceNote')}
        </p>
      </div>
    </Card>
  );
}
