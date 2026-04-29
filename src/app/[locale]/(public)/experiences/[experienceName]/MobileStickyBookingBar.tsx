'use client';

import { useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
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
import { buildBookingUrl } from '@/utils/helpers';

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

  const basePrice = experienceData.config.experiencePricePerPerson;
  const tierRoomPrice = selectedTierData
    ? Math.min(...selectedTierData.rooms.map((r) => r.pricePerNight))
    : 0;

  let displayPrice = (basePrice + tierRoomPrice) * peopleCount;
  if (roundtripTransferRequested && roundtripConfig) {
    const vehicleCount = Math.ceil(Math.max(peopleCount, 1) / roundtripConfig.maxPeoplePerVehicle);
    displayPrice += vehicleCount * roundtripConfig.pricePerVehicle;
  }

  const formattedPrice = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(displayPrice);

  const priceQualifier = peopleCount > 1
    ? t('experiences.ui.totalLabel')
    : t('experiences.ui.perPersonLabel');

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 block border-t border-emerald-500/20 bg-slate-900/90 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.3)] backdrop-blur-xl [backface-visibility:hidden] [contain:paint] [transform:translateZ(0)] [will-change:transform] lg:hidden"
    >
      <div
        className="mx-auto grid min-h-[4.5rem] max-w-screen-2xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 pt-1.5 sm:px-4"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}
      >
        <div className="min-w-0 text-left">
          <p className="truncate text-[10px] font-medium uppercase tracking-[0.08em] text-white/60">{experienceData.config.title}</p>
          <p className="whitespace-nowrap text-lg font-bold leading-tight text-white sm:text-xl">
            {formattedPrice}
            <span className="ml-1 text-[10px] font-normal text-white/60">{priceQualifier}</span>
          </p>
        </div>

        <PrimaryCtaButton
          href={bookingHref}
          size="md"
          className="w-full max-w-[176px] justify-self-end !min-h-10 px-3 text-sm"
        >
          {t('experiences.ui.experienceDetails.bookNowBtn')}
        </PrimaryCtaButton>
      </div>
    </div>
  );
}
