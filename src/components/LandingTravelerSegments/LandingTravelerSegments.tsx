'use client';

import { memo, useMemo, useState } from 'react';
import Link from 'next/link';
import type { LandingTravelerSegmentsContent } from '@/lib/schemas/landing.schema';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import { SegmentedControl } from '@/components/ui/SegmentedControl/SegmentedControl';
import { getLandingIcon } from '@/utils/landingIconMap';
import { ArrowRight } from 'lucide-react';

interface Props {
  travelerSegments: LandingTravelerSegmentsContent;
  className?: string;
}

/**
 * Traveler-segment selector. Local UI state, no shared context.
 * Renders a SegmentedControl + the active segment's recommendation panel.
 */
function LandingTravelerSegmentsComponent({ travelerSegments, className = '' }: Props) {
  const segments = travelerSegments.segments;
  const [activeId, setActiveId] = useState<string>(segments[0]?.id ?? '');

  const options = useMemo(
    () => segments.map((s) => ({ value: s.id, label: s.label })),
    [segments],
  );
  const active = useMemo(
    () => segments.find((s) => s.id === activeId) ?? segments[0],
    [segments, activeId],
  );

  if (!active) return null;

  const Icon = getLandingIcon(active.iconName);

  return (
    <SectionContainer
      as="section"
      sectionClassName={`bg-base-100 py-16 md:py-20 ${className}`.trim()}
      containerClassName="px-4 md:px-6 lg:px-10"
    >
      <header className="mx-auto mb-6 max-w-3xl text-center md:mb-8">
        <h2
          id="landing-traveler-title"
          className="text-2xl font-bold tracking-tight text-base-content md:text-3xl lg:text-4xl"
        >
          {travelerSegments.sectionTitle}
        </h2>
      </header>

      <div className="mx-auto flex max-w-2xl justify-center">
        <SegmentedControl
          options={options}
          value={active.id}
          onChange={setActiveId}
        />
      </div>

      <div
        key={active.id}
        role="region"
        aria-live="polite"
        aria-labelledby="landing-traveler-title"
        className="mx-auto mt-6 flex max-w-2xl flex-col items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-6 text-center shadow-sm backdrop-blur-md md:mt-8 md:p-8 animate-[fadeUp_280ms_ease-out] motion-reduce:animate-none"
      >
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="text-pretty text-base text-base-content/85 md:text-lg">
          {active.recommendation}
        </p>
        <Link
          href={active.ctaHref}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-content shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
        >
          {active.ctaLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </SectionContainer>
  );
}

LandingTravelerSegmentsComponent.displayName = 'LandingTravelerSegments';

export default memo(LandingTravelerSegmentsComponent);
