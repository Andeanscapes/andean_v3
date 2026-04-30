import type { LandingSafetyContent } from '@/lib/schemas/landing.schema';

export const SAFETY_FIXTURE: LandingSafetyContent = {
  sectionTitle: 'Safety and guarantees',
  lead: 'Travel with peace of mind. Every booking is backed by clear policies and on-the-ground support.',
  items: [
    { id: 'insurance', iconName: 'ShieldCheck', title: 'Travel insurance included' },
    { id: 'refunds', iconName: 'Undo2', title: 'Flexible refund policy' },
    { id: 'support', iconName: 'Headphones', title: '24/7 local coordinator' },
    { id: 'verified', iconName: 'BadgeCheck', title: 'Verified hosts' },
    { id: 'secure', iconName: 'Lock', title: 'Secure online payments' },
    { id: 'languages', iconName: 'Languages', title: 'Bilingual guides' },
  ],
};
