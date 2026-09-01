import type { LandingHeroBrandContent } from '@/lib/schemas/landing.schema';

/**
 * Test/Storybook fixture for LandingHeroBrand sub-components.
 * Mirrors the shape of LandingContent['heroBrand'] after translation.
 */
export const HERO_BRAND_FIXTURE: LandingHeroBrandContent = {
  eyebrow: 'Authentic Colombian Experiences',
  title: 'Discover Colombia Like a Local',
  subtitle: 'Hosted by locals. Built for travelers.',
  description:
    'Curated nature, culture and rural experiences in Boyacá and beyond — small groups, real hosts, secure booking.',
  backgroundImage: '/images/brand/landing-hero.webp',
  primaryCtaLabel: 'Explore experiences',
  primaryCtaHref: '/experiences',
  secondaryCtaLabel: 'Plan with us on WhatsApp',
  secondaryCtaHref: 'https://wa.me/570000000000',
  trustChips: [
    { id: 'tc-1', iconName: 'Users', label: 'Small groups' },
    { id: 'tc-2', iconName: 'MapPin', label: 'Hosted by locals' },
    { id: 'tc-3', iconName: 'CalendarCheck', label: 'Flexible planning' },
    { id: 'tc-4', iconName: 'ShieldCheck', label: 'Secure payments' },
  ],
  bookingCard: {
    reserveLabel: 'Reserve your date',
    askFirstLabel: 'Ask questions first',
    trustDeposit: '15% deposit',
    trustSecure: 'Secure payment',
    trustSupport: 'English & Spanish',
    trustVetted: 'Vetted hosts',
    nextAvailabilityLabel: 'Next availability',
    onlyLabel: 'Only',
    spotLabel: 'spot',
    spotsLeftLabel: 'spots left',
  },
  search: {
    destinationLabel: 'Destination',
    experienceTypeLabel: 'Experience type',
    durationLabel: 'Duration',
    submitLabel: 'Find experiences',
    submitHref: '/experiences',
    destinations: [
      { value: 'chivor-boyaca', label: 'Chivor, Boyacá' },
      { value: 'all', label: 'All destinations' },
    ],
    experienceTypes: [
      { value: 'all', label: 'All types' },
      { value: 'nature', label: 'Nature' },
      { value: 'culture', label: 'Culture' },
    ],
    durations: [
      { value: 'all', label: 'Any duration' },
      { value: '1d', label: '1 day' },
      { value: '2d1n', label: '2 days / 1 night' },
    ],
  },
};
