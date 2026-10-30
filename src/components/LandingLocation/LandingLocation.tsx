import { memo } from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import type { LandingLocationBrandContent } from '@/lib/schemas/landing.schema';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import { getLandingIcon } from '@/utils/landingIconMap';

interface Props {
  locationBrand: LandingLocationBrandContent;
  className?: string;
}

/** Marker positions in the 600×400 SVG viewBox, as percentages. */
const MAP_MARKERS = [
  { id: 'bogota', xPct: '25%', yPct: '70%' },
  { id: 'chivor', xPct: '75%', yPct: '37.5%' },
] as const;

/**
 * Brand "where we operate" section.
 * Two-column layout (md+): static map illustration on the left, bullet list + CTA on the right.
 */
function LandingLocationComponent({ locationBrand, className = '' }: Props) {
  return (
    <SectionContainer
      as="section"
      sectionClassName={`bg-base-200/40 py-10 md:py-14 ${className}`.trim()}
      containerClassName="px-4 md:px-6 lg:px-10"
    >
      <header className="mb-8 max-w-3xl md:mb-12">
        <h2
          id="landing-location-title"
          className="text-2xl font-bold tracking-tight text-base-content md:text-3xl lg:text-4xl"
        >
          {locationBrand.sectionTitle}
        </h2>
      </header>

      <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-10 lg:gap-14">
        {/* Matches the map's 3:2 viewBox so the % positioned markers land on the drawn points. */}
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
          <Image
            src={locationBrand.mapImage}
            alt={locationBrand.mapImageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
          />

          {MAP_MARKERS.map((marker) => (
            <span
              key={marker.id}
              aria-hidden="true"
              className="pointer-events-none absolute h-3 w-3 rounded-full border-2 border-white bg-primary shadow-sm"
              style={{ left: marker.xPct, top: marker.yPct, transform: 'translate(-50%, -50%)' }}
            />
          ))}
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
            className="inline-flex w-fit items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-content shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
          >
            {locationBrand.ctaLabel}
          </Link>
        </div>
      </div>
    </SectionContainer>
  );
}

LandingLocationComponent.displayName = 'LandingLocation';

export default memo(LandingLocationComponent);
