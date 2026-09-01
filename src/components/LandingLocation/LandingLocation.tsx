import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import type { LandingLocationBrandContent } from '@/lib/schemas/landing.schema';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import { getLandingIcon } from '@/utils/landingIconMap';
import { ArrowRight, Radio } from 'lucide-react';

interface Props {
  locationBrand: LandingLocationBrandContent;
  className?: string;
}

/** Pixel coords in the 600×400 SVG viewBox converted to percentages */
const LIVE_NODES = [
  { id: 'bogota', label: 'Bogotá', xPct: '25%', yPct: '70%' },
  { id: 'chivor', label: 'Chivor', xPct: '75%', yPct: '37.5%' },
] as const;

/**
 * Brand "where we operate" section.
 * Two-column layout (md+): static map illustration on the left, bullet list + CTA on the right.
 * SVG pulse overlays mark the live network nodes (Bogotá + Chivor).
 */
function LandingLocationComponent({ locationBrand, className = '' }: Props) {
  const t = useTranslations();
  return (
    <SectionContainer
      as="section"
      sectionClassName={`bg-base-100 py-10 md:py-14 ${className}`.trim()}
      containerClassName="px-4 md:px-6 lg:px-10"
    >
      <header className="mx-auto mb-8 max-w-3xl text-center md:mb-12">
        <h2
          id="landing-location-title"
          className="text-2xl font-bold tracking-tight text-base-content md:text-3xl lg:text-4xl"
        >
          {locationBrand.sectionTitle}
        </h2>
      </header>

      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-10 lg:gap-14">
        {/* Map with pulse overlays */}
        <div
          className="relative overflow-hidden rounded-2xl border border-base-200 bg-base-200/30 shadow-sm"
          style={{ minHeight: '240px' }}
        >
          <Image
            src={locationBrand.mapImage}
            alt={locationBrand.mapImageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
          />

          {/* Live network pulse nodes */}
          {LIVE_NODES.map((node) => (
            <span
              key={node.id}
              className="pointer-events-none absolute"
              style={{ left: node.xPct, top: node.yPct, transform: 'translate(-50%, -50%)' }}
              aria-hidden="true"
            >
              {/* Ping ring — disabled for prefers-reduced-motion */}
              <span className="absolute inset-0 h-5 w-5 animate-ping rounded-full bg-emerald-400/50 motion-reduce:hidden" />
              {/* Solid core */}
              <span className="relative block h-5 w-5 animate-pulse rounded-full border-2 border-white/80 bg-emerald-400 shadow-[0_0_10px_rgba(0,255,157,0.7)] motion-reduce:animate-none" />
            </span>
          ))}

          {/* Live-network badge */}
          <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-slate-950/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-400 backdrop-blur-sm shadow-[0_0_10px_rgba(0,255,157,0.15)]">
            <Radio className="h-3 w-3" aria-hidden="true" />
            {t('Landing.brand.location.liveNetwork')}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <ul role="list" aria-labelledby="landing-location-title" className="flex flex-col gap-3">
            {locationBrand.bullets.map((bullet) => {
              const Icon = getLandingIcon(bullet.iconName);
              return (
                <li key={bullet.id} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <p className="text-sm text-base-content/85 md:text-base">{bullet.label}</p>
                </li>
              );
            })}
          </ul>

          <Link
            href={locationBrand.ctaHref}
            className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-content shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
          >
            {locationBrand.ctaLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </SectionContainer>
  );
}

LandingLocationComponent.displayName = 'LandingLocation';

export default memo(LandingLocationComponent);

