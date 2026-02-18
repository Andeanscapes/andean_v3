import type {
  ExperienceConfig,
  TransportOption,
  RoomModeOption,
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

// Helper function to calculate pricing
export function calculatePricing(
  basePricePerPerson: number,
  peopleCount: number,
  depositPercent: number,
  roomModes: RoomModeOption[],
  roomMode: 'private' | 'couple'
) {
  const selectedRoom = roomModes.find((r) => r.value === roomMode);
  const multiplier = selectedRoom?.price_multiplier || 1;
  const effectivePeople = selectedRoom?.fixed_people || peopleCount;

  const total = basePricePerPerson * effectivePeople * multiplier;
  const depositAmount = Math.round(total * (depositPercent / 100));

  return {
    basePricePerPerson,
    total,
    depositPercent,
    depositAmount,
  };
}
