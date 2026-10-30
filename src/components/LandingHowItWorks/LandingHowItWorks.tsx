import { memo } from 'react';
import type { LandingHowItWorksContent } from '@/lib/schemas/landing.schema';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';

interface Props {
  howItWorks: LandingHowItWorksContent;
  className?: string;
}

/**
 * "How it works" horizontal numbered timeline. Pure presentational.
 * Cardless: a connecting rule joins the steps on md+, stacked on mobile.
 */
function LandingHowItWorksComponent({ howItWorks, className = '' }: Props) {
  if (howItWorks.steps.length === 0) return null;

  return (
    <SectionContainer
      as="section"
      sectionClassName={`bg-base-200/40 py-16 md:py-20 ${className}`.trim()}
      containerClassName="px-4 md:px-6 lg:px-10"
    >
      <header className="mb-10 max-w-3xl md:mb-14">
        <h2
          id="landing-howitworks-title"
          className="text-2xl font-bold tracking-tight text-base-content md:text-3xl lg:text-4xl"
        >
          {howItWorks.sectionTitle}
        </h2>
      </header>

      <ol
        aria-labelledby="landing-howitworks-title"
        className="grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-6"
      >
        {howItWorks.steps.map((step, index) => (
          <li
            key={step.id}
            className="relative flex flex-col gap-3 md:pr-4 md:before:absolute md:before:left-10 md:before:right-0 md:before:top-4 md:before:h-px md:before:bg-base-300 md:last:before:hidden"
          >
            <span
              aria-hidden="true"
              className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-primary text-sm font-bold text-primary"
            >
              {index + 1}
            </span>
            <h3 className="text-base font-semibold text-base-content md:text-lg">
              {step.title}
            </h3>
            <p className="text-sm text-base-content/75">{step.description}</p>
          </li>
        ))}
      </ol>
    </SectionContainer>
  );
}

LandingHowItWorksComponent.displayName = 'LandingHowItWorks';

export default memo(LandingHowItWorksComponent);
