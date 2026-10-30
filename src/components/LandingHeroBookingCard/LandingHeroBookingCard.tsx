'use client';

import { memo } from 'react';
import { useLocale } from 'next-intl';
import { ArrowRight, Clock3, MapPin, CalendarCheck } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { formatDayMonth } from '@/utils/dateFormatters';
import type { LandingFlagshipContent, LandingHeroBrandContent } from '@/lib/schemas/landing.schema';
import { PackageTagBadges } from '@/components/ui/PackageTagBadges/PackageTagBadges';

type BookingCardStrings = LandingHeroBrandContent['bookingCard'] & {
  duration: string;
  location: string;
};

interface Props {
  flagship: LandingFlagshipContent;
  bookingUrl: string;
  strings: BookingCardStrings;
  className?: string;
}

function LandingHeroBookingCardComponent({ flagship, bookingUrl, strings, className = '' }: Props) {
  const locale = useLocale();

  const formattedAmount = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: flagship.pricing.currency,
    maximumFractionDigits: 0,
  }).format(flagship.pricing.fromAmount);

  const nextAvail = flagship.availableDates.find((d) => d.isAvailable && d.spots > 0);
  const availabilityLabel = nextAvail
    ? `${strings.nextAvailabilityLabel}: ${formatDayMonth(nextAvail.startDate, locale)}`
    : null;

  const cardClass =
    'card relative rounded-2xl border border-white/20 bg-slate-900/45 p-4 shadow-none backdrop-blur-md md:border-white/15 md:p-6 md:backdrop-blur-xl';
  const overlayClass =
    'pointer-events-none absolute inset-0 rounded-[inherit] bg-slate-950/35';

  return (
    <div className={`${cardClass} ${className}`.trim()}>
      <div className={overlayClass} aria-hidden="true" />

      <div className="relative z-10 flex flex-col gap-3 md:gap-4">
        {/* Featured badge */}
        <span className="self-start rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-content shadow-sm">
          {flagship.badge}
        </span>

        {/* Title */}
        <h3 className="text-xl font-bold leading-tight text-white md:text-2xl">
          {flagship.title}
        </h3>

        <PackageTagBadges tags={flagship.packageTags} className="mt-2" />

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/75 md:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{strings.duration}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{strings.location}</span>
          </span>
        </div>

        {/* Price */}
        <div>
          <span className="text-xs text-white/60">{flagship.labels.fromLabel}</span>
          <span className="ml-1.5 text-xl font-bold text-white md:text-2xl">
            {formattedAmount}
          </span>
        </div>

        {/* Availability */}
        {availabilityLabel ? (
          <div
            role="status"
            aria-live="polite"
            className="inline-flex items-center gap-1.5 self-start rounded-md bg-emerald-500/15 px-2.5 py-1.5 text-[11px] font-semibold leading-tight text-emerald-400"
          >
            <CalendarCheck className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
            {availabilityLabel}
          </div>
        ) : null}

        {/* CTAs */}
        <div className="flex flex-col gap-2 pt-1">
          <Link
            href={bookingUrl}
            className="inline-flex w-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            data-event="hero_booking_card_click"
          >
            <span className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-content shadow-[0_0_20px_rgba(0,240,143,0.25)] transition-[transform,box-shadow] duration-200 active:scale-95 hover:shadow-[0_0_28px_rgba(0,240,143,0.38)]">
              {strings.reserveLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </Link>
          <a
            href={flagship.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center self-center rounded-md px-2 text-sm font-medium text-white/80 underline-offset-4 transition-colors duration-200 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            data-event="hero_whatsapp_click"
          >
            {strings.askFirstLabel}
          </a>
        </div>
      </div>
    </div>
  );
}

LandingHeroBookingCardComponent.displayName = 'LandingHeroBookingCard';

export default memo(LandingHeroBookingCardComponent);
