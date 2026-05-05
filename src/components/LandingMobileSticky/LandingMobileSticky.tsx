'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { ArrowRight, MessageCircle } from 'lucide-react';
import type { LandingContent, LandingGlobalCtasContent } from '@/lib/schemas/landing.schema';
import { PrimaryCtaButton } from '@/components/ui/Button/PrimaryCtaButton';

interface LandingMobileStickyProps {
  landingData: LandingContent;
  bookingHref?: string;
  /**
   * When provided, renders the brand-mode bar (Explore + WhatsApp + "from" price).
   * When omitted, falls back to the legacy single-experience bar (flagship/finalCta).
   */
  brandCtas?: LandingGlobalCtasContent;
}

function LandingMobileStickyComponent({ landingData, bookingHref, brandCtas }: LandingMobileStickyProps) {
  const locale = useLocale();
  const { flagship, finalCta } = landingData;
  const [visible, setVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const hero = document.getElementById('landing-hero-brand');
    if (hero) {
      observerRef.current = new IntersectionObserver(
        ([entry]) => setVisible((entry?.intersectionRatio ?? 1) < 0.1),
        { threshold: [0, 0.1] },
      );
      observerRef.current.observe(hero);
    } else {
      // fallback: scroll threshold
      const handleScroll = () => setVisible(window.scrollY > 400);
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
    return () => observerRef.current?.disconnect();
  }, []);

  if (brandCtas) {
    const formattedBrandPrice = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: brandCtas.currency,
      maximumFractionDigits: 0,
    }).format(brandCtas.fromAmount);

    return (
      <div
        role="region"
        aria-label={brandCtas.mobileBookNowLabel}
        className={`fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-950/90 px-4 py-3 shadow-[0_-14px_30px_rgba(0,0,0,0.28)] backdrop-blur-xl transition-transform duration-300 md:hidden ${visible ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-white/55">
              {brandCtas.mobileFromLabel}
            </p>
            <p className="text-lg font-extrabold leading-tight text-white">
              {formattedBrandPrice}
            </p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <a
              href={brandCtas.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={brandCtas.whatsappLabel}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
            </a>
            <PrimaryCtaButton href={bookingHref ?? brandCtas.exploreHref} variant="gradient" size="md" className="gap-1.5 px-5">
              {brandCtas.mobileBookNowLabel}
              <ArrowRight size={16} className="flex-shrink-0" aria-hidden="true" />
            </PrimaryCtaButton>
          </div>
        </div>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: flagship.pricing.currency,
    maximumFractionDigits: 0,
  }).format(flagship.pricing.fromAmount);

  return (
    <div
      role="region"
      aria-label="Book now"
      className={`fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-slate-950/95 px-4 py-3 backdrop-blur-xl transition-transform duration-300 md:hidden ${visible ? 'translate-y-0' : 'translate-y-full'}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-white/55">
            From
          </p>
          <p className="text-lg font-extrabold leading-tight text-white">
            {formattedPrice}
            <span className="ml-1 text-[10px] font-normal text-white/55">/ person</span>
          </p>
          <p className="text-[10px] font-medium text-emerald-400">
            {flagship.pricing.depositPercent}% deposit only
          </p>
        </div>
        <PrimaryCtaButton
          href={finalCta.primaryCtaHref}
          variant="gradient"
          size="md"
          className="flex-shrink-0 gap-1.5 px-5"
        >
          {flagship.labels.ctaLabel}
          <ArrowRight size={16} className="flex-shrink-0" aria-hidden="true" />
        </PrimaryCtaButton>
      </div>
    </div>
  );
}

LandingMobileStickyComponent.displayName = 'LandingMobileSticky';

export default memo(LandingMobileStickyComponent);
