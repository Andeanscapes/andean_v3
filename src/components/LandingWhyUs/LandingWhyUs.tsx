import { memo } from 'react';
import type { LandingWhyUsContent } from '@/lib/schemas/landing.schema';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import { getLandingIcon } from '@/utils/landingIconMap';

interface Props {
  whyUs: LandingWhyUsContent;
  className?: string;
}

/**
 * "Why us" value-props grid. Pure presentational.
 * Each item gets icon (resolved by name) + title + description.
 */
function LandingWhyUsComponent({ whyUs, className = '' }: Props) {
  if (whyUs.items.length === 0) return null;

  return (
    <SectionContainer
      as="section"
      sectionClassName={`bg-base-100 py-16 md:py-20 ${className}`.trim()}
      containerClassName="px-4 md:px-6 lg:px-10"
    >
      <header className="mx-auto mb-8 max-w-3xl text-center md:mb-12">
        <h2
          id="landing-whyus-title"
          className="text-2xl font-bold tracking-tight text-base-content md:text-3xl lg:text-4xl"
        >
          {whyUs.sectionTitle}
        </h2>
        <p className="mt-3 text-pretty text-base text-base-content/75 md:text-lg">
          {whyUs.lead}
        </p>
      </header>

      <ul
        role="list"
        aria-labelledby="landing-whyus-title"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4"
      >
        {whyUs.items.map((item) => {
          const Icon = getLandingIcon(item.iconName);
          return (
            <li
              key={item.id}
              className="flex flex-col items-start gap-3 rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="text-base font-semibold text-base-content md:text-lg">
                {item.title}
              </h3>
              <p className="text-sm text-base-content/75">{item.description}</p>
            </li>
          );
        })}
      </ul>
    </SectionContainer>
  );
}

LandingWhyUsComponent.displayName = 'LandingWhyUs';

export default memo(LandingWhyUsComponent);
