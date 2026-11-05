import { memo } from 'react';
import { Link } from '@/i18n/navigation';
import type { LandingFeaturedExperiencesContent } from '@/lib/schemas/landing.schema';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import LandingFeaturedExperienceCard from './LandingFeaturedExperienceCard';

interface Props {
  featured: LandingFeaturedExperiencesContent;
  /** Experience already shown in the hero card; omitted here to avoid a duplicate. */
  /**
   * The tour shown in the hero booking card. That card is hidden below md, so
   * this tour leads the carousel there and is hidden from md up (no duplicate).
   */
  heroSlug?: string;
  className?: string;
}

/**
 * "Featured experiences" grid section.
 * Uses inline-typed featured items (no catalog hydration).
 */
function LandingFeaturedExperiencesComponent({ featured, heroSlug, className = '' }: Props) {
  const heroItem = featured.items.find((experience) => experience.experienceSlug === heroSlug);
  const others = featured.items.filter((experience) => experience.experienceSlug !== heroSlug);
  const items = heroItem ? [heroItem, ...others] : others;
  if (items.length === 0) return null;

  return (
    <SectionContainer
      as="section"
      // Only the hero tour: nothing left to show once the hero card returns at md.
      sectionClassName={`bg-base-200/40 py-6 sm:py-6 sm:py-10 md:py-20 ${others.length === 0 ? 'md:hidden' : ''} ${className}`.trim()}
      containerClassName="px-4 md:px-6 lg:px-10"
    >
      <header className="mb-4 flex flex-row items-center justify-between gap-3 md:mb-12">
        <h2
          id="landing-featured-title"
          className="min-w-0 text-balance text-md font-bold sm:text-2md tracking-tight text-base-content md:text-3xl lg:text-4xl"
        >
          {featured.sectionTitle}
        </h2>
        <Link
          href={featured.viewAllHref}
          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:text-base"
        >
          {featured.viewAllLabel}
        </Link>
      </header>

      <ul
        role="list"
        aria-labelledby="landing-featured-title"
        className={`-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 md:gap-6 ${others.length >= 3 ? 'lg:grid-cols-3' : ''}`}
      >
        {items.map((experience) => (
          <li
            key={experience.id}
            className={`w-[75vw] shrink-0 snap-start sm:w-auto sm:shrink sm:h-full ${experience === heroItem ? 'md:hidden' : ''}`.trim()}
          >
            <LandingFeaturedExperienceCard experience={experience} />
          </li>
        ))}
      </ul>
    </SectionContainer>
  );
}

LandingFeaturedExperiencesComponent.displayName = 'LandingFeaturedExperiences';

export default memo(LandingFeaturedExperiencesComponent);
