import type { LandingSafetyContent } from '@/lib/schemas/landing.schema';

export const SAFETY_FIXTURE: LandingSafetyContent = {
  sectionTitle: 'Safety and guarantees',
  lead: 'Travel with peace of mind. Every booking is backed by clear policies and on-the-ground support.',
  groups: [
    {
      id: 'financial',
      title: 'Risk-free booking',
      items: [
        { id: 'refunds', iconName: 'Undo2', title: 'Flexible refund policy' },
        { id: 'secure', iconName: 'Lock', title: 'Secure online payments' },
      ],
    },
    {
      id: 'operational',
      title: 'Verified on the ground',
      items: [
        { id: 'verified', iconName: 'BadgeCheck', title: 'Verified hosts' },
        { id: 'languages', iconName: 'Languages', title: 'Bilingual guides' },
      ],
    },
    {
      id: 'assistance',
      title: 'Support along the way',
      items: [{ id: 'support', iconName: 'Headphones', title: '24/7 local coordinator' }],
      cta: {
        label: 'Message us',
        href: 'https://wa.me/0000000000',
        opensInNewTab: '(opens in a new tab)',
      },
    },
  ],
};
