import { memo } from 'react';
import { Link } from '@/i18n/navigation';
import type { LandingFeaturedExperiencesContent } from '@/lib/schemas/landing.schema';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import LandingFeaturedExperienceCard from './LandingFeaturedExperienceCard';
import { ArrowRight } from 'lucide-react';

interface Props {
  featured: LandingFeaturedExperiencesContent;
  /** Experience already shown in the hero card; omitted here to avoid a duplicate. */
  excludeSlug?: string;
  className?: string;
}

/**
 * "Featured experiences" grid section.
 * Uses inline-typed featured items (no catalog hydration).
 */
function LandingFeaturedExperiencesComponent({ featured, excludeSlug, className = '' }: Props) {
  const items = featured.items.filter((experience) => experience.experienceSlug !== excludeSlug);
  if (items.length === 0) return null;

  return (
    <SectionContainer
      as="section"
      sectionClassName={`bg-base-200/40 py-16 md:py-20 ${className}`.trim()}
      containerClassName="px-4 md:px-6 lg:px-10"
    >
      <header className="mb-8 flex flex-col items-start justify-between gap-3 md:mb-12 md:flex-row md:items-center">
        <h2
          id="landing-featured-title"
          className="text-2xl font-bold tracking-tight text-base-content md:text-3xl lg:text-4xl"
        >
          {featured.sectionTitle}
        </h2>
        <Link
          href={featured.viewAllHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:text-base"
        >
          {featured.viewAllLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </header>

      <ul
        role="list"
        aria-labelledby="landing-featured-title"
        className={`-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 md:gap-6 ${items.length >= 3 ? 'lg:grid-cols-3' : ''}`}
      >
        {items.map((experience) => (
          <li key={experience.id} className="w-[80%] shrink-0 snap-start sm:w-auto sm:shrink sm:h-full">
            <LandingFeaturedExperienceCard experience={experience} />
          </li>
        ))}
      </ul>
    </SectionContainer>
  );
}

LandingFeaturedExperiencesComponent.displayName = 'LandingFeaturedExperiences';

export default memo(LandingFeaturedExperiencesComponent);
