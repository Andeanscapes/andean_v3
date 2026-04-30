import type { LandingHowItWorksContent } from '@/lib/schemas/landing.schema';

export const HOWITWORKS_FIXTURE: LandingHowItWorksContent = {
  sectionTitle: 'How it works',
  steps: [
    {
      id: 'choose',
      iconName: 'Search',
      title: 'Choose your experience',
      description: 'Browse curated experiences hosted by local communities.',
    },
    {
      id: 'book',
      iconName: 'Calendar',
      title: 'Book your dates',
      description: 'Pick dates and group size. Pay securely online.',
    },
    {
      id: 'meet',
      iconName: 'MapPin',
      title: 'Meet your hosts',
      description: 'A local coordinator welcomes you and walks you through the day.',
    },
    {
      id: 'live',
      iconName: 'Sparkles',
      title: 'Live the experience',
      description: 'Hands-on, real-life moments. Take photos. Take memories.',
    },
  ],
};
