import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { LandingLocationBrandContent } from '@/lib/schemas/landing.schema';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import { getLandingIcon } from '@/utils/landingIconMap';
import { ArrowRight } from 'lucide-react';

interface Props {
  locationBrand: LandingLocationBrandContent;
  className?: string;
}

/**
 * Brand "where we operate" section.
 * Two-column layout (md+): static map illustration on the left, bullet list + CTA on the right.
 */
function LandingLocationComponent({ locationBrand, className = '' }: Props) {
  return (
    <SectionContainer
      as="section"
      sectionClassName={`bg-base-100 py-16 md:py-20 ${className}`.trim()}
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
        <div className="relative overflow-hidden rounded-2xl border border-base-200 bg-base-200/30 shadow-sm" style={{ minHeight: '240px' }}>
          <Image
            src={locationBrand.mapImage}
            alt={locationBrand.mapImageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
          />
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
