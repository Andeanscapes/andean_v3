import { describe, it, expect } from 'vitest';
import type { RoomModeOption } from '@/lib/schemas';
import { calculatePricing, calculatePricingForPeople, suggestRoomSelections } from './helpers';

// Multipliers encode the operational rates: individual 550.000, couple 1.000.000.
const BASE_PRICE = 500000;
const DEPOSIT_PERCENT = 15;

const ROOM_MODES: RoomModeOption[] = [
  { value: 'standard_single', label: 'single', price_multiplier: 1.1, fixed_people: 1, room_type_id: 'standard', units_available: 3, tier_id: 'heritage' },
  { value: 'standard_couple', label: 'couple', price_multiplier: 1, fixed_people: 2, room_type_id: 'standard', units_available: 3, tier_id: 'heritage' },
  { value: 'family_3', label: 'family3', price_multiplier: 31 / 30, fixed_people: 3, room_type_id: 'family', units_available: 1, tier_id: 'heritage' },
];

const ROUNDTRIP = { origin: 'Bogotá', destination: 'Chivor', pricePerVehicle: 1700000, maxPeoplePerVehicle: 4 };

describe('calculatePricingForPeople — source-of-truth totals', () => {
  it('charges the individual rate for a solo traveller', () => {
    const { total } = calculatePricingForPeople(BASE_PRICE, DEPOSIT_PERCENT, ROOM_MODES, 1, 'heritage');
    expect(total).toBe(550000);
  });

  it('charges the couple rate for two travellers', () => {
    const { total } = calculatePricingForPeople(BASE_PRICE, DEPOSIT_PERCENT, ROOM_MODES, 2, 'heritage');
    expect(total).toBe(1000000);
  });

  it('charges couple + individual for three travellers', () => {
    const { total } = calculatePricingForPeople(BASE_PRICE, DEPOSIT_PERCENT, ROOM_MODES, 3, 'heritage');
    expect(total).toBe(1550000);
  });

  it('returns integer totals despite repeating-decimal multipliers', () => {
    for (const people of [1, 2, 3, 4]) {
      const { total } = calculatePricingForPeople(BASE_PRICE, DEPOSIT_PERCENT, ROOM_MODES, people, 'heritage');
      expect(Number.isInteger(total)).toBe(true);
    }
  });

  it('applies the 15% deposit from the feed', () => {
    const { depositAmount } = calculatePricingForPeople(BASE_PRICE, DEPOSIT_PERCENT, ROOM_MODES, 2, 'heritage');
    expect(depositAmount).toBe(150000);
  });

  it('adds one private transfer vehicle for up to four travellers', () => {
    const { total, roundtripTransferCost } = calculatePricingForPeople(
      BASE_PRICE, DEPOSIT_PERCENT, ROOM_MODES, 2, 'heritage', 'roundtrip_transfer', ROUNDTRIP,
    );

    expect(roundtripTransferCost).toBe(1700000);
    expect(total).toBe(1000000 + 1700000);
  });

  it('does not charge transfer unless it is the selected transport', () => {
    const { roundtripTransferCost } = calculatePricingForPeople(
      BASE_PRICE, DEPOSIT_PERCENT, ROOM_MODES, 2, 'heritage', 'have_4x4', ROUNDTRIP,
    );
    expect(roundtripTransferCost).toBe(0);
  });
});

describe('display and checkout pricing parity', () => {
  // Guards the regression where the widget/sticky bar advertised a lower
  // figure than the reservation flow actually charged.
  it.each([1, 2, 3, 4])('agrees for %i traveller(s)', (people) => {
    const displayed = calculatePricingForPeople(
      BASE_PRICE, DEPOSIT_PERCENT, ROOM_MODES, people, 'heritage',
    );

    const checkout = calculatePricing(
      BASE_PRICE,
      DEPOSIT_PERCENT,
      ROOM_MODES,
      suggestRoomSelections(people, ROOM_MODES, 'heritage'),
    );

    expect(displayed.total).toBe(checkout.total);
    expect(displayed.depositAmount).toBe(checkout.depositAmount);
  });

  it('agrees when the private transfer is selected', () => {
    const people = 3;
    const displayed = calculatePricingForPeople(
      BASE_PRICE, DEPOSIT_PERCENT, ROOM_MODES, people, 'heritage', 'roundtrip_transfer', ROUNDTRIP,
    );

    const checkout = calculatePricing(
      BASE_PRICE,
      DEPOSIT_PERCENT,
      ROOM_MODES,
      suggestRoomSelections(people, ROOM_MODES, 'heritage'),
      'roundtrip_transfer',
      ROUNDTRIP,
    );

    expect(displayed.total).toBe(checkout.total);
  });
});
