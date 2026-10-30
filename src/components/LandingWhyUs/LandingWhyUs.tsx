import { memo } from 'react';
import type { LandingWhyUsContent } from '@/lib/schemas/landing.schema';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import { getLandingIcon } from '@/utils/landingIconMap';

interface Props {
  whyUs: LandingWhyUsContent;
  className?: string;
}

/**
 * "Why us" editorial layout. Heading on the left, value props as a divided list on the right.
 * Non-interactive: no hover lift, no card chrome.
 */
function LandingWhyUsComponent({ whyUs, className = '' }: Props) {
  if (whyUs.items.length === 0) return null;

  return (
    <SectionContainer
      as="section"
      sectionClassName={`bg-base-100 py-16 md:py-20 ${className}`.trim()}
      containerClassName="px-4 md:px-6 lg:px-10"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <header className="lg:sticky lg:top-24 lg:h-fit">
          <h2
            id="landing-whyus-title"
            className="text-2xl font-bold tracking-tight text-base-content md:text-3xl lg:text-4xl"
          >
            {whyUs.sectionTitle}
          </h2>
          <p className="mt-4 text-pretty text-base text-base-content/75 md:text-lg">
            {whyUs.lead}
          </p>
        </header>

        <ul
          role="list"
          aria-labelledby="landing-whyus-title"
          className="divide-y divide-base-200 border-y border-base-200"
        >
          {whyUs.items.map((item) => {
            const Icon = getLandingIcon(item.iconName);
            return (
              <li key={item.id} className="flex items-start gap-4 py-5 md:py-6">
                <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-base font-semibold text-base-content md:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-base-content/75">{item.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </SectionContainer>
  );
}

LandingWhyUsComponent.displayName = 'LandingWhyUs';

export default memo(LandingWhyUsComponent);
