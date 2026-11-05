'use client';

import { memo, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { LandingTravelerSegmentsContent } from '@/lib/schemas/landing.schema';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import { SegmentedControl } from '@/components/ui/SegmentedControl/SegmentedControl';
import { getResponsiveImageSrc } from '@/utils/responsiveImage';
import { getLandingIcon } from '@/utils/landingIconMap';

interface Props {
  travelerSegments: LandingTravelerSegmentsContent;
  className?: string;
}

/**
 * Traveler-profile switcher. Pill tabs swap a split panel: the profile's photo
 * on one side, its title, three benefits and the CTA on the other.
 * Local UI state only; every segment's copy is server-rendered in the payload.
 */
function LandingTravelerSegmentsComponent({ travelerSegments, className = '' }: Props) {
  const segments = travelerSegments.segments;
  const [activeId, setActiveId] = useState<string>(segments[0]?.id ?? '');

  const options = useMemo(
    () =>
      segments.map((s) => {
        const Icon = getLandingIcon(s.iconName);
        return {
          value: s.id,
          label: (
            <span className="inline-flex items-center gap-1.5">
              <Icon className="h-4 w-4" aria-hidden="true" />
              {s.label}
            </span>
          ),
        };
      }),
    [segments],
  );
  const active = useMemo(
    () => segments.find((s) => s.id === activeId) ?? segments[0],
    [segments, activeId],
  );

  if (!active) return null;

  return (
    <SectionContainer
      as="section"
      labelledBy="landing-traveler-title"
      sectionClassName={`bg-base-100 py-6 sm:py-10 md:py-20 ${className}`.trim()}
      containerClassName="px-4 md:px-6 lg:px-10"
    >
      <header className="mb-6 max-w-3xl md:mb-8">
        <h2
          id="landing-traveler-title"
          className="text-balance text-md font-bold sm:text-2md tracking-tight text-base-content md:text-3xl lg:text-4xl"
        >
          {travelerSegments.sectionTitle}
        </h2>
      </header>

      <SegmentedControl
        variant="pills"
        options={options}
        value={active.id}
        onChange={setActiveId}
        className="justify-start"
      />

      <div
        key={active.id}
        role="region"
        aria-live="polite"
        aria-label={active.title}
        className="mt-6 grid grid-cols-1 items-center gap-6 rounded-3xl border border-base-content/10 bg-base-200/60 p-4 animate-[fadeUp_280ms_ease-out] motion-reduce:animate-none md:mt-8 md:grid-cols-2 md:gap-10 md:p-6"
      >
        <picture>
          <source media="(max-width: 767px)" srcSet={getResponsiveImageSrc(active.image).mobile} />
          <img
            src={active.image}
            alt={active.imageAlt}
            loading="lazy"
            decoding="async"
            className="h-[240px] w-full rounded-2xl border border-base-content/10 object-cover shadow-lg sm:h-[320px]"
          />
        </picture>

        <div className="px-2 pb-2 md:px-0 md:pb-0">
          <h3 className="text-md font-semibold tracking-tight text-base-content md:text-2xl">
            {active.title}
          </h3>
          <ul role="list" className="mt-5 flex flex-col gap-3">
            {active.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-base text-base-content/85">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
                </span>
                {bullet}
              </li>
            ))}
          </ul>
          <Link
            href={active.ctaHref}
            className="mt-7 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-semibold text-primary-content shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
          >
            {active.ctaLabel}
          </Link>
        </div>
      </div>
    </SectionContainer>
  );
}

LandingTravelerSegmentsComponent.displayName = 'LandingTravelerSegments';

export default memo(LandingTravelerSegmentsComponent);
