'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card/Card';
import { useReservationPricing } from '@/hooks/experiences/useReservationContext';
import { useLanguageContext } from '@/contexts/LanguageContext';

interface PriceSummaryProps {
  depositPercent?: number;
}

export function PriceSummary({ depositPercent = 15 }: PriceSummaryProps) {
  const { total, depositAmount } = useReservationPricing();
  const t = useTranslations('experiences.ui');
  const { currentLocale } = useLanguageContext();

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
    <Card className="mb-6 bg-base-200 border-2 border-base-300/50">
      <div className="space-y-2">
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
