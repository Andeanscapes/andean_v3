import { memo } from 'react';
import type { LandingSafetyContent } from '@/lib/schemas/landing.schema';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import { getLandingIcon } from '@/utils/landingIconMap';

interface Props {
  safety: LandingSafetyContent;
  className?: string;
}

/**
 * Brand "safety & guarantees" section.
 * Compact icon-row card with a lead paragraph + a flat list of reassurance items.
 */
function LandingSafetyComponent({ safety, className = '' }: Props) {
  if (safety.items.length === 0) return null;

  return (
    <SectionContainer
      as="section"
      sectionClassName={`bg-base-200/40 py-16 md:py-20 ${className}`.trim()}
      containerClassName="px-4 md:px-6 lg:px-10"
    >
      <header className="mx-auto mb-8 max-w-3xl text-center md:mb-10">
        <h2
          id="landing-safety-title"
          className="text-2xl font-bold tracking-tight text-base-content md:text-3xl lg:text-4xl"
        >
          {safety.sectionTitle}
        </h2>
        <p className="mt-3 text-pretty text-base text-base-content/75 md:text-lg">
          {safety.lead}
        </p>
      </header>

      <ul
        role="list"
        aria-labelledby="landing-safety-title"
        className="mx-auto grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3"
      >
        {safety.items.map((item) => {
          const Icon = getLandingIcon(item.iconName);
          return (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-base-200 bg-base-100 p-4 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                <Icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <span className="text-sm font-medium text-base-content md:text-base">
                {item.title}
              </span>
            </li>
          );
        })}
      </ul>
    </SectionContainer>
  );
}

LandingSafetyComponent.displayName = 'LandingSafety';

export default memo(LandingSafetyComponent);
