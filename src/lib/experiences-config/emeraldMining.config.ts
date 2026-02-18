import type { ExperienceData } from '../experiences/types';

/**
 * Mock data for Emerald Mining Adventure - TECHNICAL DATA ONLY
 * This contains only non-translatable data (prices, IDs, limits, etc.)
 * Translatable content comes from i18n messages
 * 
 * In the future, this will come from API:
 * GET /api/experiences/emeraldMining
 */
export const EMERALD_MINING_DATA: ExperienceData = {
  config: {
    id: 'emeraldMining',
    // Translation keys - actual text comes from i18n messages
    title: 'experiences.emeraldMining.title',
    subtitle: 'experiences.emeraldMining.subtitle',
    description: 'experiences.emeraldMining.description',
    // Technical data (from server/database)
    basePricePerPerson: 430000,
    depositPercent: 15,
    maxPeople: 10,
    minPeople: 1,
    // These should be translation keys too
    includesItems: [
      'experiences.emeraldMining.includes.guide',
      'experiences.emeraldMining.includes.equipment',
      'experiences.emeraldMining.includes.transport',
      'experiences.emeraldMining.includes.insurance',
    ],
    includesFullDetails: 'experiences.emeraldMining.includesFullDetails',
    microcopy: {
      deposit: 'experiences.common.deposit',
      balance: 'experiences.common.balance',
      security: 'experiences.common.security',
      ctaPrimary: 'experiences.common.ctaPrimary',
      ctaSecondary: 'experiences.common.ctaSecondary',
    },
  },
  transportOptions: [
    {
      value: 'car_no_4x4',
      label: 'experiences.emeraldMining.transport.carNo4x4',
      description: 'experiences.emeraldMining.transport.carNo4x4Description',
    },
    {
      value: 'have_4x4',
      label: 'experiences.emeraldMining.transport.have4x4',
      description: 'experiences.emeraldMining.transport.have4x4Description',
    },
    {
      value: 'bus',
      label: 'experiences.emeraldMining.transport.bus',
      description: 'experiences.emeraldMining.transport.busDescription',
    },
  ],
  roomModes: [
    {
      value: 'private',
      label: 'experiences.emeraldMining.roomMode.private',
      price_multiplier: 1,
    },
    {
      value: 'couple',
      label: 'experiences.emeraldMining.roomMode.couple',
      price_multiplier: 1.2,
      fixed_people: 2,
    },
  ],
  availableDates: [
    {
      id: 'mar-16-2026',
      startDate: '2026-03-16T00:00:00.000Z',
      endDate: '2026-03-17T23:59:59.999Z',
      spots: 2,
      isAvailable: true,
    },
    {
      id: 'apr-06-2026',
      startDate: '2026-04-06T00:00:00.000Z',
      endDate: '2026-04-07T23:59:59.999Z',
      spots: 4,
      isAvailable: true,
    },
    {
      id: 'apr-20-2026',
      startDate: '2026-04-20T00:00:00.000Z',
      endDate: '2026-04-21T23:59:59.999Z',
      spots: 3,
      isAvailable: true,
    },
    {
      id: 'may-04-2026',
      startDate: '2026-05-04T00:00:00.000Z',
      endDate: '2026-05-05T23:59:59.999Z',
      spots: 0,
      isAvailable: false,
    },
  ],
  whatsappLink:
    'https://wa.me/573142730360?text=Hola%2C%20quiero%20reservar%20la%20Aventura%20de%20Miner%C3%ADa%20de%20Esmeraldas',
};
