import { memo } from 'react';
import type { LandingTrustStatsContent } from '@/lib/schemas/landing.schema';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';

interface Props {
  trustStats: LandingTrustStatsContent;
  className?: string;
}

/**
 * Compact KPI strip ("trust stats"). Pure presentational.
 * Each stat exposes value (large) + label (smaller, descriptive).
 */
function LandingTrustStatsComponent({ trustStats, className = '' }: Props) {
  if (trustStats.items.length === 0) return null;

  return (
    <SectionContainer
      as="section"
      sectionClassName={`bg-primary text-primary-content py-8 md:py-10 ${className}`.trim()}
      containerClassName="px-4 md:px-6 lg:px-10"
    >
      <h2 id="landing-truststats-title" className="sr-only">
        {trustStats.srTitle}
      </h2>
      <dl
        aria-labelledby="landing-truststats-title"
        className="grid grid-cols-2 gap-6 text-center md:grid-cols-4"
      >
        {trustStats.items.map((item) => (
          <div key={item.id} className="flex flex-col items-center gap-1">
            <dt className="order-2 text-xs font-medium uppercase tracking-wide text-primary-content/80 md:text-sm">
              {item.label}
            </dt>
            <dd className="order-1 text-3xl font-bold md:text-4xl lg:text-5xl">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </SectionContainer>
  );
}

LandingTrustStatsComponent.displayName = 'LandingTrustStats';

export default memo(LandingTrustStatsComponent);
