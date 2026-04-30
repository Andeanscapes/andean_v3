import { memo } from 'react';
import type { LandingCategoriesContent } from '@/lib/schemas/landing.schema';
import { SectionContainer } from '@/components/ui/SectionContainer/SectionContainer';
import LandingCategoryCard from './LandingCategoryCard';

interface Props {
  categories: LandingCategoriesContent;
  className?: string;
}

/**
 * Brand-level "What kind of trip do you want?" grid.
 * Server-renderable; no client interactivity.
 */
function LandingCategoriesComponent({ categories, className = '' }: Props) {
  if (categories.items.length === 0) return null;

  return (
    <SectionContainer
      as="section"
      sectionClassName={`bg-base-100 py-16 md:py-20 ${className}`.trim()}
      containerClassName="px-4 md:px-6 lg:px-10"
    >
      <h2
        id="landing-categories-title"
        className="mb-8 text-center text-2xl font-bold tracking-tight text-base-content md:mb-12 md:text-3xl lg:text-4xl"
      >
        {categories.sectionTitle}
      </h2>

      <ul
        role="list"
        aria-labelledby="landing-categories-title"
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 md:gap-6 lg:grid-cols-4"
      >
        {categories.items.map((category) => (
          <li key={category.id} className="w-[80%] shrink-0 snap-start sm:w-auto sm:shrink sm:h-full">
            <LandingCategoryCard category={category} />
          </li>
        ))}
      </ul>
    </SectionContainer>
  );
}

LandingCategoriesComponent.displayName = 'LandingCategories';

export default memo(LandingCategoriesComponent);
