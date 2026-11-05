'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import type { ExperienceData } from '@/lib/schemas';
import {
  useDetailSelectedTierData,
  useDetailPeopleCount,
  useDetailSelectedTier,
  useDetailSelectedDate,
  useDetailTransport,
  useDetailRoundtripTransfer,
} from '@/hooks/experiences/useExperienceDetailContext';
import { PrimaryCtaButton } from '@/components/ui/Button/PrimaryCtaButton';
import { buildBookingUrl, calculatePricingForPeople } from '@/utils/helpers';
import { formatMoney } from '@/utils/formatCurrency';

interface MobileStickyBookingBarProps {
  experienceData: ExperienceData;
}

export default function MobileStickyBookingBar({
  experienceData,
}: MobileStickyBookingBarProps) {
  const locale = useLocale();
  const t = useTranslations();
  const selectedTierData = useDetailSelectedTierData();
  const { peopleCount } = useDetailPeopleCount();
  const { selectedTierId } = useDetailSelectedTier();
  const { selectedDateId } = useDetailSelectedDate();
  const { transportMode } = useDetailTransport();
  const { roundtripTransferRequested } = useDetailRoundtripTransfer();
  const pathname = usePathname();

  const roundtripConfig = selectedTierData?.roundtripTransfer ?? null;

  const bookingHref = useMemo(
    () =>
      buildBookingUrl(`${pathname}/booking`, {
        tier: selectedTierId,
        date: selectedDateId,
        people: peopleCount,
        transport: roundtripTransferRequested ? 'roundtrip_transfer' : transportMode,
      }),
    [pathname, selectedTierId, selectedDateId, peopleCount, transportMode, roundtripTransferRequested],
  );

  const { total: displayPrice } = calculatePricingForPeople(
    experienceData.config.experiencePricePerPerson,
    experienceData.config.depositPercent,
    experienceData.roomModes,
    peopleCount,
    selectedTierId,
    roundtripTransferRequested ? 'roundtrip_transfer' : transportMode,
    roundtripConfig,
  );

  const formattedPrice = formatMoney(displayPrice, locale, experienceData.config.currency);

  const priceQualifier = peopleCount > 1
    ? t('experiences.ui.totalLabel')
    : t('experiences.ui.perPersonLabel');

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 block border-t border-zinc-200 bg-white/95 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] backdrop-blur-md [backface-visibility:hidden] [contain:paint] [transform:translateZ(0)] [will-change:transform] lg:hidden dark:border-zinc-800/80 dark:bg-zinc-950 dark:shadow-[0_-14px_30px_rgba(0,0,0,0.28)] dark:backdrop-blur-none"
    >
      {/* Height is mirrored by getBottomBarSpacerClass in PublicLayoutShell (footer clearance); update both together. */}
      <div
        className="mx-auto grid min-h-16 max-w-screen-2xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 pt-2.5"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.625rem)' }}
      >
        <div className="min-w-0 text-left">
          <p className="truncate text-xs font-medium text-zinc-600 dark:text-zinc-400">{experienceData.config.title}</p>
          <p className="truncate text-base font-bold leading-tight text-zinc-900 [font-variant-numeric:tabular-nums] dark:text-white">
            {formattedPrice}
            <span className="ml-1 text-xs font-normal text-zinc-600 dark:text-zinc-400">{priceQualifier}</span>
          </p>
        </div>

        <PrimaryCtaButton
          href={bookingHref}
          size="md"
          fullWidth={false}
          className="shrink-0 justify-self-end rounded-xl px-4 text-xs font-semibold"
        >
          {t('experiences.ui.experienceDetails.bookNowBtn')}
        </PrimaryCtaButton>
      </div>
    </div>
  );
}
