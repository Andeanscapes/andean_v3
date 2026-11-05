import type { LandingTravelerSegmentsContent } from '@/lib/schemas/landing.schema';

export const TRAVELER_SEGMENTS_FIXTURE: LandingTravelerSegmentsContent = {
  sectionTitle: 'Designed for every kind of traveler',
  segments: [
    {
      id: 'couples',
      iconName: 'Heart',
      label: 'Couples',
      title: 'For couples who want time to themselves',
      bullets: ['Private hosts', 'Quiet landscapes', 'Space to disconnect'],
      image: 'https://cdn.andeanscapes.com/images/brand/segments/couples.webp',
      imageAlt: 'Couple facing a mountain peak',
      ctaLabel: 'See couple experiences',
      ctaHref: '/experiences?segment=couples',
    },
    {
      id: 'families',
      iconName: 'Users',
      label: 'Families',
      title: 'For families exploring together',
      bullets: ['Farm visits', 'Gentle hikes', 'Hands-on activities'],
      image: 'https://cdn.andeanscapes.com/images/brand/segments/families.webp',
      imageAlt: 'Family group at the mine',
      ctaLabel: 'See family experiences',
      ctaHref: '/experiences?segment=families',
    },
    {
      id: 'solo',
      iconName: 'Compass',
      label: 'Solo travelers',
      title: 'For solo travelers',
      bullets: ['Small groups', 'Local hosts', 'New friends'],
      image: 'https://cdn.andeanscapes.com/images/brand/segments/nomads.webp',
      imageAlt: 'Traveler beside a waterfall',
      ctaLabel: 'See solo experiences',
      ctaHref: '/experiences?segment=solo',
    },
  ],
};
