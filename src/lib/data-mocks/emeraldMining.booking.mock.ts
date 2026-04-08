import type { ExperienceData } from '../schemas';

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
    // Image paths - configurable per experience
    images: {
      heroBackground: '/assets/images/hero/h10.webp',
      valuePropositionTile1: '/assets/images/hero/h10.webp',
      valuePropositionTile2: '/assets/images/hero/h7.webp',
      valuePropositionTile3: '/assets/images/hero/h8.webp',
    },
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
    // Trip logistics data - will be translated by service
    logistics: [
      { id: 'start', icon: 'clock', label: 'experiences.emeraldMining.logistics.start', value: '11:00 AM' },
      { id: 'duration', icon: 'hourglass', label: 'experiences.emeraldMining.logistics.duration', value: '3 Hours' },
      { id: 'transport', icon: 'car', label: 'experiences.emeraldMining.logistics.transport', value: '4x4' },
      { id: 'difficulty', icon: 'activity', label: 'experiences.emeraldMining.logistics.difficulty', value: 'Moderate' },
      { id: 'end', icon: 'sunset', label: 'experiences.emeraldMining.logistics.end', value: '3:30 PM' },
    ],
    // Included items - will be translated by service
    included: [
      { id: 'guide', title: 'experiences.emeraldMining.included.guide' },
      { id: 'equipment', title: 'experiences.emeraldMining.included.equipment' },
      { id: 'meals', title: 'experiences.emeraldMining.included.meals' },
      { id: 'insurance', title: 'experiences.emeraldMining.included.insurance' },
    ],
    // Not included items - will be translated by service
    notIncluded: [
      { id: 'accommodation', title: 'experiences.emeraldMining.notIncluded.accommodation' },
      { id: 'drinks', title: 'experiences.emeraldMining.notIncluded.drinks' },
      { id: 'souvenirs', title: 'experiences.emeraldMining.notIncluded.souvenirs' },
    ],
    // Meeting point coordinates — Chivor, Boyacá, Colombia
    location: {
      lat: 4.8699,
      lng: -73.2897,
      label: 'Chivor, Boyacá, Colombia',
      zoom: 13,
    },
    // Itinerary stops - will be translated by service
    itinerary: [
      {
        id: 'stop-1',
        time: '11:00 AM',
        title: 'experiences.emeraldMining.itinerary.stop1Title',
        description: 'experiences.emeraldMining.itinerary.stop1Desc',
        imageUrl: '/assets/images/hero/h10.webp',
        notes: [
          'experiences.emeraldMining.itinerary.stop1Note1',
          'experiences.emeraldMining.itinerary.stop1Note2',
          'experiences.emeraldMining.itinerary.stop1Note3',
        ],
      },
      {
        id: 'stop-2',
        time: '12:00 PM',
        title: 'experiences.emeraldMining.itinerary.stop2Title',
        description: 'experiences.emeraldMining.itinerary.stop2Desc',
        imageUrl: '/assets/images/hero/h11.webp',
        notes: [
          'experiences.emeraldMining.itinerary.stop2Note1',
          'experiences.emeraldMining.itinerary.stop2Note2',
          'experiences.emeraldMining.itinerary.stop2Note3',
        ],
      },
      {
        id: 'stop-3',
        time: '1:00 PM',
        title: 'experiences.emeraldMining.itinerary.stop3Title',
        description: 'experiences.emeraldMining.itinerary.stop3Desc',
        imageUrl: '/assets/images/hero/h8.webp',
        notes: [
          'experiences.emeraldMining.itinerary.stop3Note1',
          'experiences.emeraldMining.itinerary.stop3Note2',
          'experiences.emeraldMining.itinerary.stop3Note3',
        ],
      },
      {
        id: 'stop-4',
        time: '2:00 PM',
        title: 'experiences.emeraldMining.itinerary.stop4Title',
        description: 'experiences.emeraldMining.itinerary.stop4Desc',
        notes: [
          'experiences.emeraldMining.itinerary.stop4Note1',
          'experiences.emeraldMining.itinerary.stop4Note2',
          'experiences.emeraldMining.itinerary.stop4Note3',
        ],
      },
      {
        id: 'stop-5',
        time: '3:00 PM',
        title: 'experiences.emeraldMining.itinerary.stop5Title',
        description: 'experiences.emeraldMining.itinerary.stop5Desc',
        imageUrl: '/assets/images/hero/h7.webp',
        notes: [
          'experiences.emeraldMining.itinerary.stop5Note1',
          'experiences.emeraldMining.itinerary.stop5Note2',
          'experiences.emeraldMining.itinerary.stop5Note3',
        ],
      },
      {
        id: 'stop-6',
        time: '4:30 PM',
        title: 'experiences.emeraldMining.itinerary.stop6Title',
        description: 'experiences.emeraldMining.itinerary.stop6Desc',
        notes: [
          'experiences.emeraldMining.itinerary.stop6Note1',
          'experiences.emeraldMining.itinerary.stop6Note2',
          'experiences.emeraldMining.itinerary.stop6Note3',
        ],
      },
    ],
    // Host / guide data - translatable content as keys, non-translatable as values
    host: {
      name: 'Carlos',
      avatarUrl: '/assets/images/hero/h7.webp',
      bio: 'experiences.emeraldMining.host.bio',
      idealForItems: [
        'experiences.emeraldMining.host.idealFor1',
        'experiences.emeraldMining.host.idealFor2',
        'experiences.emeraldMining.host.idealFor3',
      ],
      goodToKnowItems: [
        'experiences.emeraldMining.host.goodToKnow1',
        'experiences.emeraldMining.host.goodToKnow2',
        'experiences.emeraldMining.host.goodToKnow3',
      ],
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
