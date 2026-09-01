'use client';

import { useMemo } from 'react';
import { Car, House, Coins } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card/Card';
import {
  useReservationPricing,
  useReservationCurrency,
  useReservationTier,
  useReservationAccommodationTiers,
  useReservationDate,
  useReservationRooms,
  useReservationRoomModes,
  useReservationTransport,
} from '@/hooks/experiences/useReservationContext';
import { useLanguageContext } from '@/contexts/LanguageContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import { formatMoney } from '@/utils/formatCurrency';
import type { TransportOption } from '@/lib/schemas';

interface PriceSummaryProps {
  depositPercent: number;
  transportOptions: TransportOption[];
  experienceTitle: string;
}

export function PriceSummary({ depositPercent, transportOptions, experienceTitle }: PriceSummaryProps) {
  const { total, depositAmount, roundtripTransferCost } = useReservationPricing();
  const currency = useReservationCurrency();
  const { selectedTierId } = useReservationTier();
  const tiersContent = useReservationAccommodationTiers();
  const { selectedDateLabel, selectedDateId } = useReservationDate();
  const { peopleCount, roomSelections } = useReservationRooms();
  const roomModes = useReservationRoomModes();
  const { transportMode } = useReservationTransport();
  const t = useTranslations('experiences.ui');
  const { currentLocale } = useLanguageContext();
  const { theme } = useThemeContext();
  const isDark = theme === 'dark';

  const selectedTier = tiersContent?.tiers.find((t) => t.id === selectedTierId);
  const roundtripConfig = selectedTier?.roundtripTransfer ?? null;
  const allInclusiveCost = Math.max(total - roundtripTransferCost, 0);

  const selectedTransport = useMemo(
    () => transportOptions.find((o) => o.value === transportMode)?.label ?? null,
    [transportOptions, transportMode]
  );

  const roomSummary = useMemo(() => {
    if (roomSelections.length === 0) return null;
    return roomSelections
      .map((selection) => {
        const mode = roomModes.find((m) => m.value === selection.roomMode);
        return mode ? `${selection.quantity} x ${mode.label}` : null;
      })
      .filter((v): v is string => v !== null)
      .join(' · ');
  }, [roomModes, roomSelections]);

  const missingStep = useMemo(() => {
    if (!selectedDateId) return t('mobileDockMissingDate');
    if (peopleCount < 1 || roomSelections.length === 0) return t('mobileDockMissingRooms');
    if (!transportMode) return t('mobileDockMissingTransport');
    return null;
  }, [selectedDateId, peopleCount, roomSelections, transportMode, t]);

  const cardClass = isDark
    ? 'mb-4 border-2 border-[#00F08F]/20 bg-slate-900/50 backdrop-blur-2xl !p-4 lg:!p-6'
    : 'mb-4 border-2 border-emerald-200 bg-white/95 shadow-[0_20px_50px_rgba(0,0,0,0.18)] !p-4 lg:!p-6';

  const formatPrice = (price: number) => formatMoney(price, currentLocale, currency);

  const notSelected = t('mobileDockNotSelected');
  const dlTermClass = `text-xs ${isDark ? 'text-base-content/50' : 'text-neutral-500'}`;
  const dlDefClass = `text-xs font-medium truncate ${isDark ? 'text-base-content' : 'text-neutral-800'}`;

  return (
    <Card className={cardClass}>
      <div className="space-y-2">
        {/* Experience title header */}
        <div className={`mb-1 pb-2 border-b ${isDark ? 'border-white/10' : 'border-neutral-200'}`}>
          <p className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-primary/80' : 'text-emerald-700'}`}>
            {experienceTitle}
          </p>
        </div>

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

        {/* Booking details breakdown */}
        <dl className={`grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 pb-2 border-b ${isDark ? 'border-white/10' : 'border-neutral-200'}`}>
          <dt className={dlTermClass}>{t('mobileDockDate')}</dt>
          <dd className={dlDefClass}>{selectedDateLabel ?? notSelected}</dd>

          <dt className={dlTermClass}>{t('mobileDockPeople')}</dt>
          <dd className={dlDefClass}>
            {peopleCount > 0 ? t('mobileDockPeopleSummary', { count: peopleCount }) : notSelected}
          </dd>

          <dt className={dlTermClass}>{t('mobileDockStay')}</dt>
          <dd className={dlDefClass}>{selectedTier?.tierLabel ?? notSelected}</dd>

          <dt className={dlTermClass}>{t('mobileDockRoom')}</dt>
          <dd className={dlDefClass}>{roomSummary ?? notSelected}</dd>

          <dt className={dlTermClass}>{t('mobileDockTransport')}</dt>
          <dd className={dlDefClass}>{selectedTransport ?? notSelected}</dd>
        </dl>

        {roundtripTransferCost > 0 && roundtripConfig && (
          <div className={`grid grid-cols-[1fr_auto] items-start gap-x-3 text-sm py-1.5 ${isDark ? 'text-base-content/70' : 'text-neutral-600'}`}>
            <span className="flex items-start gap-1.5">
              <Car size={14} className={`mt-0.5 shrink-0 ${isDark ? 'text-primary' : 'text-emerald-600'}`} />
              {t('roundtripTransferLineItem', { origin: roundtripConfig.origin, destination: roundtripConfig.destination })}
            </span>
            <span className="font-medium text-right tabular-nums">
              {formatPrice(roundtripTransferCost)}
            </span>
          </div>
        )}

        {allInclusiveCost > 0 && (
          <div className={`grid grid-cols-[1fr_auto] items-start gap-x-3 text-sm py-1.5 ${isDark ? 'text-base-content/70' : 'text-neutral-600'}`}>
            <span className="flex items-start gap-1.5">
              <House size={14} className={`mt-0.5 shrink-0 ${isDark ? 'text-primary' : 'text-emerald-600'}`} />
              {t('allInclusiveLineItem', { count: peopleCount })}
            </span>
            <span className="font-medium text-right tabular-nums">
              {formatPrice(allInclusiveCost)}
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

        {missingStep ? (
          <p className={`mt-2 rounded-xl border px-2.5 py-1.5 text-xs font-medium ${isDark ? 'border-amber-400/15 bg-amber-400/10 text-amber-300' : 'border-amber-400/30 bg-amber-50 text-amber-700'}`}>
            {missingStep}
          </p>
        ) : (
          <p className={`flex items-center gap-1.5 text-xs mt-3 ${isDark ? 'text-primary/90' : 'text-[#006B40]'}`}>
            <Coins size={12} className="shrink-0" />
            {t('balanceNote')}
          </p>
        )}
      </div>
    </Card>
  );
}
