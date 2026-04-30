import type { LandingTrustStatsContent } from '@/lib/schemas/landing.schema';

export const TRUST_STATS_FIXTURE: LandingTrustStatsContent = {
  srTitle: 'Trust statistics',
  items: [
    { id: 'travelers', value: '500+', label: 'Travelers hosted' },
    { id: 'communities', value: '12', label: 'Local communities' },
    { id: 'rating', value: '4.9★', label: 'Average rating' },
    { id: 'years', value: '6', label: 'Years operating' },
  ],
};
