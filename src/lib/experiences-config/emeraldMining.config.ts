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
      value: 'standard_single',
      label: 'experiences.emeraldMining.roomMode.standardSingle',
      price_multiplier: 1,
      fixed_people: 1,
      room_type_id: 'standard',
      units_available: 3,
    },
    {
      value: 'standard_couple',
      label: 'experiences.emeraldMining.roomMode.standardCouple',
      price_multiplier: 1.1,
      fixed_people: 2,
      room_type_id: 'standard',
      units_available: 3,
    },
    {
      value: 'family_single',
      label: 'experiences.emeraldMining.roomMode.familySingle',
      price_multiplier: 1.05,
      fixed_people: 1,
      room_type_id: 'family',
      units_available: 1,
    },
    {
      value: 'family_couple',
      label: 'experiences.emeraldMining.roomMode.familyCouple',
      price_multiplier: 1.05,
      fixed_people: 2,
      room_type_id: 'family',
      units_available: 1,
    },
    {
      value: 'family_3',
      label: 'experiences.emeraldMining.roomMode.familyThree',
      price_multiplier: 1.1,
      fixed_people: 3,
      room_type_id: 'family',
      units_available: 1,
    },
    {
      value: 'cabin_single',
      label: 'experiences.emeraldMining.roomMode.cabinSingle',
      price_multiplier: 1.2,
      fixed_people: 1,
      room_type_id: 'cabin',
      units_available: 1,
    },
    {
      value: 'cabin_couple',
      label: 'experiences.emeraldMining.roomMode.cabinCouple',
      price_multiplier: 1.2,
      fixed_people: 2,
      room_type_id: 'cabin',
      units_available: 1,
    },
    {
      value: 'cabin_6',
      label: 'experiences.emeraldMining.roomMode.cabinSix',
      price_multiplier: 1.3,
      fixed_people: 6,
      room_type_id: 'cabin',
      units_available: 1,
    },
  ],
  availableDates: [
    {
      id: 'mar-07-2026',
      startDate: '2026-03-07T00:00:00.000Z',
      endDate: '2026-03-08T23:59:59.999Z',
      spots: 6,
      isAvailable: true,
    },
    {
      id: 'mar-14-2026',
      startDate: '2026-03-14T00:00:00.000Z',
      endDate: '2026-03-15T23:59:59.999Z',
      spots: 5,
      isAvailable: true,
    },
    {
      id: 'mar-21-2026',
      startDate: '2026-03-21T00:00:00.000Z',
      endDate: '2026-03-22T23:59:59.999Z',
      spots: 4,
      isAvailable: true,
    },
    {
      id: 'mar-28-2026',
      startDate: '2026-03-28T00:00:00.000Z',
      endDate: '2026-03-29T23:59:59.999Z',
      spots: 3,
      isAvailable: true,
    },
    {
      id: 'apr-04-2026',
      startDate: '2026-04-04T00:00:00.000Z',
      endDate: '2026-04-05T23:59:59.999Z',
      spots: 6,
      isAvailable: true,
    },
    {
      id: 'apr-11-2026',
      startDate: '2026-04-11T00:00:00.000Z',
      endDate: '2026-04-12T23:59:59.999Z',
      spots: 5,
      isAvailable: true,
    },
    {
      id: 'apr-18-2026',
      startDate: '2026-04-18T00:00:00.000Z',
      endDate: '2026-04-19T23:59:59.999Z',
      spots: 4,
      isAvailable: true,
    },
    {
      id: 'apr-25-2026',
      startDate: '2026-04-25T00:00:00.000Z',
      endDate: '2026-04-26T23:59:59.999Z',
      spots: 3,
      isAvailable: true,
    },
    {
      id: 'may-02-2026',
      startDate: '2026-05-02T00:00:00.000Z',
      endDate: '2026-05-03T23:59:59.999Z',
      spots: 6,
      isAvailable: true,
    },
    {
      id: 'may-09-2026',
      startDate: '2026-05-09T00:00:00.000Z',
      endDate: '2026-05-10T23:59:59.999Z',
      spots: 5,
      isAvailable: true,
    },
    {
      id: 'may-16-2026',
      startDate: '2026-05-16T00:00:00.000Z',
      endDate: '2026-05-17T23:59:59.999Z',
      spots: 4,
      isAvailable: true,
    },
    {
      id: 'may-23-2026',
      startDate: '2026-05-23T00:00:00.000Z',
      endDate: '2026-05-24T23:59:59.999Z',
      spots: 3,
      isAvailable: true,
    },
  ],
  whatsappLink:
    'https://wa.me/573142730360?text=Hola%2C%20quiero%20reservar%20la%20Aventura%20de%20Miner%C3%ADa%20de%20Esmeraldas',
};
