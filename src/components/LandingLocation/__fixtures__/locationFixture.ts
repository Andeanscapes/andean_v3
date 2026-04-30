import type { LandingLocationBrandContent } from '@/lib/schemas/landing.schema';

export const LOCATION_FIXTURE: LandingLocationBrandContent = {
  sectionTitle: 'Where we operate',
  mapImage: '/landing/map-bogota-chivor.svg',
  mapImageAlt: 'Map showing the route from Bogotá to Chivor in Boyacá.',
  bullets: [
    {
      id: 'starts-bogota',
      iconName: 'Plane',
      label: 'All experiences start in Bogotá — easy connection from the international airport.',
    },
    {
      id: 'highlands',
      iconName: 'Mountain',
      label: 'Hosted in the Boyacá highlands, 2–4 hours from the capital.',
    },
    {
      id: 'transport',
      iconName: 'Car',
      label: 'Private transfers included. No public-bus juggling.',
    },
  ],
  ctaLabel: 'See how we get there',
  ctaHref: '/about#how-we-operate',
};
