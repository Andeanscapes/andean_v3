'use client';

import { memo, useEffect, useState } from 'react';

import type {
  ExperienceConfig,
  ExperienceHeroBadgeIcon,
  ExperienceHeroContent,
} from '@/lib/schemas';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { getResponsiveImageSrc } from '@/utils/responsiveImage';

type ExperienceHeroProps = {
  config?: ExperienceConfig;
  heroContent?: ExperienceHeroContent;
  content?: ExperienceHeroContent;
};

type NavigatorWithConnection = Navigator & {
  connection?: {
    saveData?: boolean;
  };
};

function HeroBadgeIcon({ icon }: { icon: ExperienceHeroBadgeIcon }) {
  if (icon === 'none') {
    return null;
  }

  if (icon === 'deposit') {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function ExperienceHeroComponent({ config, heroContent, content }: ExperienceHeroProps) {
  // Blank counts as unset: an unset CI variable inlines as '', and `??` would
  // keep it and emit a relative video URL that 404s on the Worker.
  const videoCdnBaseUrl =
    process.env.NEXT_PUBLIC_CDN_BASE_URL?.trim() || 'https://cdn.andeanscapes.com';
  const normalizedVideoCdnBaseUrl = videoCdnBaseUrl.replace(/\/$/, '');
  const VIDEO_URL = `${normalizedVideoCdnBaseUrl}/videos/experiences/emerald-mining/hero.webm`;
  const MOBILE_VIDEO_URL = `${normalizedVideoCdnBaseUrl}/videos/experiences/emerald-mining/hero-mobile.webm`;
  const [shouldRenderVideo, setShouldRenderVideo] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);

  useEffect(() => {
    const supportsMatchMedia = typeof window.matchMedia === 'function';
    const isDesktop = supportsMatchMedia
      ? window.matchMedia('(min-width: 768px)').matches
      : true;
    const prefersReducedMotion = supportsMatchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
    const navigatorWithConnection = navigator as NavigatorWithConnection;
    const hasDataSaver = navigatorWithConnection.connection?.saveData === true;

    setIsDesktopViewport(isDesktop);
    setShouldRenderVideo(!prefersReducedMotion && !hasDataSaver);
  }, []);

  // Priority: heroContent (from service) > content (override) > build from config
  const resolvedContent: Required<ExperienceHeroContent> = {
    title: heroContent?.title ?? content?.title ?? config?.title ?? '',
    subtitle: heroContent?.subtitle ?? content?.subtitle ?? config?.subtitle ?? '',
    summary: heroContent?.summary ?? content?.summary ?? '',
    highlightText: heroContent?.highlightText ?? content?.highlightText ?? '',
    ctaLabel: heroContent?.ctaLabel ?? content?.ctaLabel ?? '',
    helperText: heroContent?.helperText ?? content?.helperText ?? '',
    hideCta: heroContent?.hideCta ?? content?.hideCta ?? false,
    ctaTargetId: heroContent?.ctaTargetId ?? content?.ctaTargetId ?? 'available-dates',
    backgroundImageUrl: heroContent?.backgroundImageUrl ?? content?.backgroundImageUrl ?? '/assets/images/hero/h10.webp',
    badges: heroContent?.badges ?? content?.badges ?? [],
  };

  const handleCtaClick = () => {
    if (typeof window === 'undefined') {
      return;
    }

    const datesSection = document.getElementById(resolvedContent.ctaTargetId);
    if (datesSection) {
      datesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const headerEl = document.querySelector('header');
      const headerHeight = headerEl?.getBoundingClientRect().height ?? 0;
      const offset = headerHeight - 400;
      window.requestAnimationFrame(() => {
        window.scrollBy({ top: -offset, behavior: 'smooth' });
      });
      return;
    }

    window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
  };

  return (
    <div
      className="relative w-full h-[31vh] min-h-[230px] md:h-[50vh] md:min-h-0 overflow-hidden bg-base-950"
    >
      {/* <picture> with responsive sources — proper LCP candidate,
          discoverable by preload scanner, benefits from fetchPriority.
          Mobile variant is ~70 % smaller than the desktop image. */}
      <picture>
        <source
          media="(max-width: 767px)"
          srcSet={getResponsiveImageSrc(resolvedContent.backgroundImageUrl).mobile}
        />
        <img
          src={resolvedContent.backgroundImageUrl}
          alt=""
          aria-hidden="true"
          width={1900}
          height={900}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>
      {/* Video Background */}
      {shouldRenderVideo ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload={isDesktopViewport ? 'metadata' : 'none'}
          className="absolute inset-0 w-full h-full object-cover bg-base-950"
        >
          <source src={MOBILE_VIDEO_URL} type="video/webm" media="(max-width: 767px)" />
          <source src={VIDEO_URL} type="video/webm" />
          Your browser does not support the video tag.
        </video>
      ) : null}

      {/* Overlay stack for contrast */}
      <div className="pointer-events-none absolute inset-0 bg-black/40" />
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 hidden h-48 w-48 rounded-full bg-emerald-400/25 blur-3xl md:block md:h-72 md:w-72" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center pt-8 backdrop-blur-sm md:pt-16 md:backdrop-blur-md">
        <div className="w-full max-w-5xl rounded-2xl bg-base-950/70 px-4 py-2.5 md:px-8 md:py-8">
          <div className="text-center">
            <h1 className="mb-1 text-[1.35rem] font-bold leading-tight text-white drop-shadow-lg md:mb-2 md:text-4xl lg:text-5xl">
              {resolvedContent.title}
            </h1>
            <p className="mx-auto mb-1.5 max-w-[34ch] text-sm font-medium leading-snug text-slate-100/95 drop-shadow-md md:mb-2 md:max-w-none md:text-xl md:leading-normal">
              {resolvedContent.subtitle}
            </p>
            <p className="hidden md:block text-xs md:text-sm text-white/80 mb-3">
              {resolvedContent.summary}
            </p>
            <p className="hidden md:block text-sm md:text-base text-white/85 mb-5">
              {resolvedContent.highlightText}
            </p>

            <div className="flex flex-col items-center justify-center gap-0 md:gap-2">
              {!resolvedContent.hideCta ? (
                <Button
                  variant="primary"
                  size="lg"
                  className="h-12 min-h-[48px] px-6 text-sm font-semibold shadow-md transition duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/50 md:text-base"
                  onClick={handleCtaClick}
                >
                  {resolvedContent.ctaLabel}
                </Button>
              ) : null}
              <p className="mt-1.5 text-[11px] leading-tight text-white/70 md:mt-2 md:text-sm md:text-white/75">
                {resolvedContent.helperText}
              </p>
            </div>
            
            <div className="mt-4 hidden flex-wrap justify-center gap-2 md:mt-5 md:flex md:gap-3">
              {resolvedContent.badges.map((badge) => (
                <Badge
                  key={badge.label}
                  variant="secondary"
                  size="sm"
                  className="border-white/20 bg-base-900/80 px-2 py-0.5 text-[11px] text-white shadow-sm backdrop-blur-md md:px-2.5 md:py-1 md:text-xs"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <HeroBadgeIcon icon={badge.icon ?? 'none'} />
                    <span>{badge.label}</span>
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ExperienceHero = memo(ExperienceHeroComponent);
