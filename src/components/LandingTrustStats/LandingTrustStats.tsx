import { memo } from 'react';
import type { LandingTrustStatsContent } from '@/lib/schemas/landing.schema';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';

interface Props {
  trustStats: LandingTrustStatsContent;
  className?: string;
}

/**
 * Quiet metrics row. Pure presentational.
 * Values come from the feed; no decorative band, sits between hairlines.
 */
function LandingTrustStatsComponent({ trustStats, className = '' }: Props) {
  if (trustStats.items.length === 0) return null;

  return (
    <SectionContainer
      as="section"
      sectionClassName={`border-y border-base-200 bg-base-100 py-8 md:py-10 ${className}`.trim()}
      containerClassName="px-4 md:px-6 lg:px-10"
    >
      <h2 id="landing-truststats-title" className="sr-only">
        {trustStats.srTitle}
      </h2>
      <dl
        aria-labelledby="landing-truststats-title"
        className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-center md:gap-x-20"
      >
        {trustStats.items.map((item) => (
          <div key={item.id} className="flex flex-col items-center gap-1">
            <dd className="order-1 text-3xl font-bold text-base-content md:text-4xl">
              {item.value}
            </dd>
            <dt className="order-2 text-sm text-base-content/70">
              {item.label}
            </dt>
          </div>
        ))}
      </dl>
    </SectionContainer>
  );
}

LandingTrustStatsComponent.displayName = 'LandingTrustStats';

export default memo(LandingTrustStatsComponent);
