import type { LandingCategoriesContent } from '@/lib/schemas/landing.schema';

export const CATEGORIES_FIXTURE: LandingCategoriesContent = {
  sectionTitle: 'What kind of trip do you want?',
  items: [
    {
      id: 'emerald',
      iconName: 'Gem',
      title: 'Emerald & Mining',
      description: "Live the legend of Colombia's emerald country with local miners.",
      imageUrl: '/assets/images/packages/p1-1.webp',
      href: '/experiences?type=culture',
      ctaLabel: 'Explore',
    },
    {
      id: 'nature',
      iconName: 'Mountain',
      title: 'Nature & Reserves',
      description: 'Cloud forests, paramos and waterfalls off the beaten path.',
      imageUrl: '/assets/images/packages/p2-1.webp',
      href: '/experiences?type=nature',
      ctaLabel: 'Explore',
    },
    {
      id: 'rural',
      iconName: 'Home',
      title: 'Rural & Coffee',
      description: 'Stay with farming families and learn ancestral trades.',
      imageUrl: '/assets/images/packages/p4-1.webp',
      href: '/experiences?type=rural',
      ctaLabel: 'Explore',
    },
    {
      id: 'horseback',
      iconName: 'Compass',
      title: 'Horseback & Hiking',
      description: 'Cross Andean trails the way locals always have.',
      imageUrl: '/assets/images/destination/d1-1.webp',
      href: '/experiences?type=adventure',
      ctaLabel: 'Explore',
    },
  ],
};
