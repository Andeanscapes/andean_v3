import type { LandingWhyUsContent } from '@/lib/schemas/landing.schema';

export const WHYUS_FIXTURE: LandingWhyUsContent = {
  sectionTitle: 'Why travel with Andean Scapes',
  lead: 'Local hosts. Authentic experiences. Zero tourist traps.',
  items: [
    {
      id: 'authentic',
      iconName: 'Heart',
      title: 'Authentic encounters',
      description: 'You sit in real homes, real workshops, real mines. No staged shows.',
    },
    {
      id: 'fair-trade',
      iconName: 'Scale',
      title: 'Fair-trade tourism',
      description: 'Hosts set their own prices. Most of what you pay stays in their hands.',
    },
    {
      id: 'small-groups',
      iconName: 'Users',
      title: 'Small groups',
      description: 'Max 6 travelers per experience. Everyone gets a seat at the table.',
    },
    {
      id: 'support',
      iconName: 'LifeBuoy',
      title: 'Local support 24/7',
      description: 'Bilingual coordinators on the ground from the moment you land.',
    },
  ],
};
