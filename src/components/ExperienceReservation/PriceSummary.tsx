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
import { formatMoney } from '@/utils/formatCurrency';
import type { TransportOption } from '@/lib/schemas';

interface PriceSummaryProps {
  depositPercent: number;
  transportOptions: TransportOption[];
  experienceTitle: string;
  isDayTrip?: boolean;
}

export function PriceSummary({ depositPercent, transportOptions, experienceTitle, isDayTrip = false }: PriceSummaryProps) {
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

  const formatPrice = (price: number) => formatMoney(price, currentLocale, currency);

  const notSelected = t('mobileDockNotSelected');
  const dlTermClass = 'text-xs text-base-content/70';
  const dlDefClass = 'text-xs font-medium truncate text-base-content';

  return (
    <Card padding="responsive" className="mb-4">
      <div className="space-y-2">
        {/* Experience title header */}
        <div className="mb-1 pb-2 border-b border-base-content/10">
          <p className="text-sm font-semibold text-primary">
            {experienceTitle}
          </p>
        </div>

        {selectedTier && !isDayTrip && (
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-base-content/10">
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md">
              {/* Above-fold LCP candidate — eager load with high fetch priority */}
              <img src={selectedTier.images.thumbnail ?? selectedTier.images.main} alt={selectedTier.tierLabel} className="h-full w-full object-cover" loading="eager" decoding="async" fetchPriority="high" />
            </div>
            <span className="text-sm font-medium text-base-content/80">
              {selectedTier.tierLabel}
            </span>
          </div>
        )}

        {/* Booking details breakdown */}
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 pb-2 border-b border-base-content/10">
          <dt className={dlTermClass}>{t('mobileDockDate')}</dt>
          <dd className={dlDefClass}>{selectedDateLabel ?? notSelected}</dd>

          <dt className={dlTermClass}>{t('mobileDockPeople')}</dt>
          <dd className={dlDefClass}>
            {peopleCount > 0 ? t('mobileDockPeopleSummary', { count: peopleCount }) : notSelected}
          </dd>

          {!isDayTrip && (
            <>
              <dt className={dlTermClass}>{t('mobileDockStay')}</dt>
              <dd className={dlDefClass}>{selectedTier?.tierLabel ?? notSelected}</dd>

              <dt className={dlTermClass}>{t('mobileDockRoom')}</dt>
              <dd className={dlDefClass}>{roomSummary ?? notSelected}</dd>
            </>
          )}

          <dt className={dlTermClass}>{t('mobileDockTransport')}</dt>
          <dd className={dlDefClass}>{selectedTransport ?? notSelected}</dd>
        </dl>

        {roundtripTransferCost > 0 && roundtripConfig && (
          <div className="grid grid-cols-[1fr_auto] items-start gap-x-3 text-sm py-1.5 text-base-content/80">
            <span className="flex items-start gap-1.5">
              <Car size={14} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              {t('roundtripTransferLineItem', { origin: roundtripConfig.origin, destination: roundtripConfig.destination })}
            </span>
            <span className="font-medium text-right tabular-nums">
              {formatPrice(roundtripTransferCost)}
            </span>
          </div>
        )}

        {allInclusiveCost > 0 && (
          <div className="grid grid-cols-[1fr_auto] items-start gap-x-3 text-sm py-1.5 text-base-content/80">
            <span className="flex items-start gap-1.5">
              <House size={14} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              {t(isDayTrip ? 'dayTripLineItem' : 'allInclusiveLineItem', { count: peopleCount })}
            </span>
            <span className="font-medium text-right tabular-nums">
              {formatPrice(allInclusiveCost)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="font-semibold text-base-content">
            {t('totalLabel')}:
          </span>
          <span className="text-base md:text-lg font-bold text-base-content tabular-nums">
            {formatPrice(total)}
          </span>
        </div>
        <div className="divider my-2"></div>
        <div className="flex justify-between items-center -mx-4 px-4 py-2 rounded-lg bg-emerald-50 dark:bg-primary/5">
          <span className="text-sm font-semibold text-base-content">
            {t('payTodayLabel')} ({depositPercent}%):
          </span>
          <span className="text-md md:text-xl font-bold text-primary tabular-nums">
            {formatPrice(depositAmount)}
          </span>
        </div>

        {missingStep ? (
          <p className="mt-2 rounded-xl border px-2.5 py-1.5 text-xs font-medium border-amber-400/30 bg-amber-50 text-amber-700 dark:border-amber-400/15 dark:bg-amber-400/10 dark:text-amber-300">
            {missingStep}
          </p>
        ) : (
          <p className="flex items-center gap-1.5 text-xs mt-3 text-primary">
            <Coins size={12} className="shrink-0" aria-hidden="true" />
            {t('balanceNote')}
          </p>
        )}
      </div>
    </Card>
  );
}
