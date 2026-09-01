import type { LandingCategoriesContent } from '@/lib/schemas/landing.schema';

export const CATEGORIES_FIXTURE: LandingCategoriesContent = {
  sectionTitle: 'What kind of trip do you want?',
  items: [
    {
      id: 'emerald',
      iconName: 'Gem',
      title: 'Emerald & Mining',
      description: "Live the legend of Colombia's emerald country with local miners.",
      imageUrl: '/images/brand/categories/emerald-mining.webp',
      href: '/experiences?type=culture',
      ctaLabel: 'Explore',
    },
    {
      id: 'nature',
      iconName: 'Mountain',
      title: 'Nature & Reserves',
      description: 'Cloud forests, paramos and waterfalls off the beaten path.',
      imageUrl: '/images/brand/categories/nature.webp',
      href: '/experiences?type=nature',
      ctaLabel: 'Explore',
    },
    {
      id: 'rural',
      iconName: 'Home',
      title: 'Rural & Coffee',
      description: 'Stay with farming families and learn ancestral trades.',
      imageUrl: '/images/brand/categories/rural.webp',
      href: '/experiences?type=rural',
      ctaLabel: 'Explore',
    },
    {
      id: 'horseback',
      iconName: 'Compass',
      title: 'Horseback & Hiking',
      description: 'Cross Andean trails the way locals always have.',
      imageUrl: '/images/brand/categories/horseback.webp',
      href: '/experiences?type=adventure',
      ctaLabel: 'Explore',
    },
  ],
};
