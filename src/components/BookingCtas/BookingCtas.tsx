'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BOOKING_LINKS } from '@/constant/SiteConfig';
import { trackBookingCtaClick } from '@/lib/meta-pixel';

type BookingCtasProps = {
  title?: string;
  subtitle?: string;
  enableStickyCta?: boolean;
  airbnbRating?: number;
  airbnbReviewsCount?: number;
  onAirbnbClick?: () => void;
  onWhatsAppClick?: () => void;
};

export default function BookingCtas({
  title,
  subtitle,
  enableStickyCta = true,
  airbnbRating,
  airbnbReviewsCount,
  onAirbnbClick,
  onWhatsAppClick,
}: BookingCtasProps) {
  const t = useTranslations('BookingCtas');
  const [isMounted, setIsMounted] = useState(false);
  const showRating = airbnbRating !== undefined && airbnbReviewsCount !== undefined;
  const resolvedTitle = title ?? t('title');
  const resolvedSubtitle = subtitle ?? t('subtitle');
  const airbnbCtaLabel = t('airbnbCta');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAirbnbClick = useCallback(() => {
    trackBookingCtaClick('airbnb', 'booking_cta');
    onAirbnbClick?.();
  }, [onAirbnbClick]);

  const handleWhatsAppClick = useCallback(() => {
    trackBookingCtaClick('whatsapp', 'booking_cta');
    onWhatsAppClick?.();
  }, [onWhatsAppClick]);

  const handleStickyAirbnbClick = useCallback(() => {
    trackBookingCtaClick('airbnb', 'booking_cta_sticky');
    onAirbnbClick?.();
  }, [onAirbnbClick]);

  const handleStickyWhatsAppClick = useCallback(() => {
    trackBookingCtaClick('whatsapp', 'booking_cta_sticky');
    onWhatsAppClick?.();
  }, [onWhatsAppClick]);

  const stickyCta = (
    <div className="fixed inset-x-0 bottom-0 z-[45] border-t border-base-300 bg-base-100/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-3xl flex-col gap-1">
        <Link
          href={BOOKING_LINKS.airbnb}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleStickyAirbnbClick}
          className="btn btn-primary btn-md w-full"
        >
          {airbnbCtaLabel}
        </Link>
        <Link
          href={BOOKING_LINKS.whatsappMiningAdventure}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleStickyWhatsAppClick}
          className="link link-hover self-center text-xs"
        >
          {t('stickyWhatsappText')}
        </Link>
      </div>
    </div>
  );

  return (
    <section className={`container py-10 lg:py-16 ${enableStickyCta ? 'pb-24 md:pb-16' : ''}`}>
      <div className="mx-auto w-full max-w-3xl">
        <div className="card border border-base-300 bg-base-100 shadow-sm">
          <div className="card-body gap-5 p-6 md:p-8">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">{resolvedTitle}</h2>
              <p className="mt-2 text-base-content/80">{resolvedSubtitle}</p>
            </div>

            <div>
              <Link
                href={BOOKING_LINKS.airbnb}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleAirbnbClick}
                className="btn btn-primary btn-lg w-full md:w-auto"
              >
                {airbnbCtaLabel}
              </Link>

              <div className="mt-3 space-y-1 text-sm text-base-content/80">
                {showRating ? (
                  <p>{`⭐ ${airbnbRating} · ${airbnbReviewsCount}+ ${t('reviewsLabel')}`}</p>
                ) : null}
                <p>{t('airbnbSupport')}</p>
                <p>{t('trustPolicy')}</p>
                <p className="pt-1 text-xs text-base-content/70">{t('bookingScopeNote')}</p>
              </div>
            </div>

            <div className="rounded-box border border-base-300 bg-base-200 p-4">
              <p className="text-sm font-medium text-base-content/90">{t('whatsappHelpText')}</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href={BOOKING_LINKS.whatsappMiningAdventure}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWhatsAppClick}
                  className="btn btn-outline btn-sm md:btn-md"
                >
                  {t('whatsappCta')}
                </Link>
                <p className="text-xs text-base-content/70">
                  {t('whatsappSupport')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {enableStickyCta && isMounted ? createPortal(stickyCta, document.body) : null}
    </section>
  );
}
