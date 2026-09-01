'use client';

import { memo } from 'react';
import { useLocale } from 'next-intl';
import { ArrowRight, Clock3, MapPin, MessageCircle, ShieldCheck, BadgeCheck, CalendarCheck, Lock } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { formatDayMonth } from '@/utils/dateFormatters';
import type { LandingFlagshipContent, LandingHeroBrandContent } from '@/lib/schemas/landing.schema';

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
    ? (() => {
        const date = formatDayMonth(nextAvail.startDate, locale);
        const spotsLabel = nextAvail.spots === 1 ? strings.spotLabel : strings.spotsLeftLabel;
        return `${strings.nextAvailabilityLabel}: ${date} — ${strings.onlyLabel} ${nextAvail.spots} ${spotsLabel}`;
      })()
    : null;

  const trustBadges = [
    { id: 'bk-1', icon: ShieldCheck, label: strings.trustDeposit },
    { id: 'bk-2', icon: Lock, label: strings.trustSecure },
    { id: 'bk-3', icon: CalendarCheck, label: strings.trustSupport },
    { id: 'bk-4', icon: BadgeCheck, label: strings.trustVetted },
  ];

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

        {/* Trust badges */}
        <div className="flex flex-wrap gap-1.5">
          {trustBadges.map((badge) => (
            <span
              key={badge.id}
              className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-1 text-[10px] font-medium text-white/80"
            >
              <badge.icon className="h-3 w-3" aria-hidden="true" />
              {badge.label}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2.5 pt-1 sm:flex-row">
          <Link href={bookingUrl} className="inline-flex flex-1" data-event="hero_booking_card_click">
            <span className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-content shadow-[0_0_20px_rgba(0,240,143,0.25)] transition-all duration-200 active:scale-95 hover:shadow-[0_0_28px_rgba(0,240,143,0.38)]">
              {strings.reserveLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </Link>
          <a
            href={flagship.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/8 px-4 py-3 text-sm font-medium text-white transition-all duration-200 active:scale-95 hover:bg-white/12"
            data-event="hero_whatsapp_click"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            {strings.askFirstLabel}
          </a>
        </div>
      </div>
    </div>
  );
}

LandingHeroBookingCardComponent.displayName = 'LandingHeroBookingCard';

export default memo(LandingHeroBookingCardComponent);
