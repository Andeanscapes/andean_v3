import type { LandingTravelerSegmentsContent } from '@/lib/schemas/landing.schema';

export const TRAVELER_SEGMENTS_FIXTURE: LandingTravelerSegmentsContent = {
  sectionTitle: 'Designed for every kind of traveler',
  segments: [
    {
      id: 'couples',
      iconName: 'Heart',
      label: 'Couples',
      recommendation: 'Intimate experiences in highland villages, perfect for two.',
      ctaLabel: 'See couple experiences',
      ctaHref: '/experiences?segment=couples',
    },
    {
      id: 'families',
      iconName: 'Users',
      label: 'Families',
      recommendation: 'Hands-on activities the whole family can enjoy together.',
      ctaLabel: 'See family experiences',
      ctaHref: '/experiences?segment=families',
    },
    {
      id: 'solo',
      iconName: 'Compass',
      label: 'Solo travelers',
      recommendation: 'Small groups where you arrive alone and leave with friends.',
      ctaLabel: 'See solo experiences',
      ctaHref: '/experiences?segment=solo',
    },
  ],
};
