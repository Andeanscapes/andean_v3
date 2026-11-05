import { memo } from 'react';
import type { LandingWhyUsContent } from '@/lib/schemas/landing.schema';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import { getLandingIcon } from '@/utils/landingIconMap';
import { getResponsiveImageSrc } from '@/utils/responsiveImage';
import { MapPin } from 'lucide-react';

interface Props {
  whyUs: LandingWhyUsContent;
  className?: string;
}

/**
 * "Why us" asymmetric split. Heading + optional host portrait on the left,
 * value props as soft cards on the right.
 */
function LandingWhyUsComponent({ whyUs, className = '' }: Props) {
  if (whyUs.items.length === 0) return null;

  const { portrait } = whyUs;

  return (
    <SectionContainer
      as="section"
      sectionClassName={`bg-base-200/40 py-6 sm:py-10 md:py-20 ${className}`.trim()}
      containerClassName="px-4 md:px-6 lg:px-10"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <header>
            <h2
              id="landing-whyus-title"
              className="text-balance text-md font-bold sm:text-2md tracking-tight text-base-content md:text-3xl lg:text-4xl"
            >
              {whyUs.sectionTitle}
            </h2>
            <p className="mt-4 text-pretty text-base text-base-content/80 md:text-lg">
              {whyUs.lead}
            </p>
          </header>

          {portrait ? (
            <figure className="relative mt-6 h-56 w-full overflow-hidden rounded-xl sm:mt-8 sm:h-[390px] sm:rounded-2xl border border-base-content/10 bg-base-200 md:h-[430px] lg:max-w-md">
              <picture>
                <source
                  media="(max-width: 767px)"
                  srcSet={getResponsiveImageSrc(portrait.image).mobile}
                />
                <img
                  src={portrait.image}
                  alt={portrait.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </picture>
              <figcaption className="absolute bottom-4 left-4 right-4 flex w-fit items-center gap-2 rounded-xl border border-white/15 bg-black/65 px-3 py-1.5 text-xs font-medium tracking-wide text-white shadow-lg backdrop-blur-md">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-400" aria-hidden="true" />
                {portrait.caption}
              </figcaption>
            </figure>
          ) : null}
        </div>

        <ul role="list" aria-labelledby="landing-whyus-title" className="flex flex-col gap-3 md:gap-4">
          {whyUs.items.map((item) => {
            const Icon = getLandingIcon(item.iconName);
            return (
              <li
                key={item.id}
                className="flex items-start gap-3 rounded-2xl border border-zinc-200/80 bg-white p-3.5 shadow-card dark:border-base-content/10 dark:bg-base-200/60 dark:shadow-none md:gap-3.5 md:p-6"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary md:h-9 md:w-9 md:rounded-xl">
                  <Icon className="h-3.5 w-3.5 md:h-[18px] md:w-[18px]" strokeWidth={2.25} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-base-content md:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-base-content/80 md:text-base md:leading-normal">{item.description}</p>
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
