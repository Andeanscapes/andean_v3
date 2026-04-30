import { memo } from 'react';
import type { LandingHowItWorksContent } from '@/lib/schemas/landing.schema';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import { getLandingIcon } from '@/utils/landingIconMap';

interface Props {
  howItWorks: LandingHowItWorksContent;
  className?: string;
}

/**
 * "How it works" numbered steps. Pure presentational.
 * Renders an ordered list with a numeric marker + icon per step.
 */
function LandingHowItWorksComponent({ howItWorks, className = '' }: Props) {
  if (howItWorks.steps.length === 0) return null;

  return (
    <SectionContainer
      as="section"
      sectionClassName={`bg-base-200/40 py-16 md:py-20 ${className}`.trim()}
      containerClassName="px-4 md:px-6 lg:px-10"
    >
      <header className="mx-auto mb-8 max-w-3xl text-center md:mb-12">
        <h2
          id="landing-howitworks-title"
          className="text-2xl font-bold tracking-tight text-base-content md:text-3xl lg:text-4xl"
        >
          {howItWorks.sectionTitle}
        </h2>
      </header>

      <ol
        aria-labelledby="landing-howitworks-title"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4"
      >
        {howItWorks.steps.map((step, index) => {
          const Icon = getLandingIcon(step.iconName);
          return (
            <li
              key={step.id}
              className="relative flex flex-col gap-3 rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-content"
                >
                  {index + 1}
                </span>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <h3 className="text-base font-semibold text-base-content md:text-lg">
                {step.title}
              </h3>
              <p className="text-sm text-base-content/75">{step.description}</p>
            </li>
          );
        })}
      </ol>
    </SectionContainer>
  );
}

LandingHowItWorksComponent.displayName = 'LandingHowItWorks';

export default memo(LandingHowItWorksComponent);
