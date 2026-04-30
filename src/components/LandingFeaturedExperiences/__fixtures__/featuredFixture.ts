import type { LandingFeaturedExperiencesContent } from '@/lib/schemas/landing.schema';

export const FEATURED_FIXTURE: LandingFeaturedExperiencesContent = {
  sectionTitle: 'Featured experiences',
  viewAllLabel: 'View all experiences',
  viewAllHref: '/experiences',
  items: [
    {
      id: 'emerald-mining-adventure',
      experienceSlug: 'emerald-mining-adventure',
      title: 'Emerald Mining Adventure',
      description: "Two days inside Chivor's emerald mines, hosted by working miners.",
      image: '/assets/images/packages/p1-1.webp',
      href: '/experiences/emerald-mining-adventure',
      badge: 'Featured',
      duration: '2 days / 1 night',
      location: 'Chivor, Boyacá',
      fromAmount: 470000,
      currency: 'COP',
      fromLabel: 'From',
      viewDetailsLabel: 'View details',
    },
    {
      id: 'ancestral-pottery-experience',
      experienceSlug: 'ancestral-pottery-experience',
      title: 'Ancestral Pottery Experience',
      description: 'Shape clay with master artisans in the pottery capital of Colombia.',
      image: '/assets/images/packages/p4-1.webp',
      href: '/experiences',
      badge: 'New',
      duration: '1 day',
      location: 'Ráquira, Boyacá',
      fromAmount: 320000,
      currency: 'COP',
      fromLabel: 'From',
      viewDetailsLabel: 'View details',
    },
  ],
};
