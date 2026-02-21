import type {
  ExperienceConfig,
  TransportOption,
  RoomModeOption,
  RoomSelection,
} from './types';

export function createExperienceConfig(
  config: ExperienceConfig,
  transportOptions: TransportOption[],
  roomModes: RoomModeOption[]
) {
  return {
    ...config,
    transportOptions,
    roomModes,
  };
}

export function computePeopleCount(
  roomSelections: RoomSelection[],
  roomModes: RoomModeOption[]
) {
  return roomSelections.reduce((sum, selection) => {
    const mode = roomModes.find((room) => room.value === selection.roomMode);
    const peoplePerRoom = mode?.fixed_people ?? 1;
    return sum + peoplePerRoom * selection.quantity;
  }, 0);
}

// Helper function to calculate pricing
export function calculatePricing(
  basePricePerPerson: number,
  depositPercent: number,
  roomModes: RoomModeOption[],
  roomSelections: RoomSelection[]
) {
  const total = roomSelections.reduce((sum, selection) => {
    const mode = roomModes.find((room) => room.value === selection.roomMode);
    const multiplier = mode?.price_multiplier ?? 1;
    const peoplePerRoom = mode?.fixed_people ?? 1;
    return sum + basePricePerPerson * peoplePerRoom * multiplier * selection.quantity;
  }, 0);
  const depositAmount = Math.round(total * (depositPercent / 100));

  return {
    basePricePerPerson,
    total,
    depositPercent,
    depositAmount,
  };
}
