/**
 * Generic helper utilities for experiences and other features
 */

import type {
  ExperienceConfig,
  TransportOption,
  RoomModeOption,
  RoomSelection,
  TransportMode,
  RoundtripTransferConfig,
} from '@/lib/schemas';

/** Selections that can be forwarded from the detail page to booking via query string. */
export interface BookingSelections {
  tier?: string | null;
  date?: string | null;
  people?: number | null;
  transport?: TransportMode | null;
}

const TRANSPORT_VALUES = new Set<string>(['car_no_4x4', 'have_4x4', 'bus', 'roundtrip_transfer']);

/**
 * Build a relative booking URL that encodes the given selections as query parameters.
 * Only non-null / non-undefined values are included.
 */
export function buildBookingUrl(basePath: string, selections: BookingSelections): string {
  const params = new URLSearchParams();

  if (selections.tier) params.set('tier', selections.tier);
  if (selections.date) params.set('date', selections.date);
  if (selections.people != null && selections.people > 0) params.set('people', String(selections.people));
  if (selections.transport) params.set('transport', selections.transport);

  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/**
 * Parse and validate booking query-string parameters.
 * Returns only values that are syntactically valid; ignores unknown/invalid keys.
 */
export function parseBookingSearchParams(
  params: Record<string, string | string[] | undefined>
): BookingSelections {
  const tier = typeof params.tier === 'string' && params.tier.length > 0 ? params.tier : null;
  const date = typeof params.date === 'string' && params.date.length > 0 ? params.date : null;

  let people: number | null = null;
  if (typeof params.people === 'string') {
    const n = Number(params.people);
    if (Number.isFinite(n) && n > 0) people = n;
  }

  let transport: TransportMode | null = null;
  if (typeof params.transport === 'string' && TRANSPORT_VALUES.has(params.transport)) {
    transport = params.transport as TransportMode;
  }

  return { tier, date, people, transport };
}

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

/** Fixed COP amount added to total when community contribution is enabled (~$5 USD). */
export const COMMUNITY_CONTRIBUTION_COP = 20_000;

export function calculatePricing(
  experiencePricePerPerson: number,
  depositPercent: number,
  roomModes: RoomModeOption[],
  roomSelections: RoomSelection[],
  transportMode?: TransportMode | null,
  roundtripTransferConfig?: RoundtripTransferConfig | null,
  communityContributionEnabled?: boolean,
) {
  const roomTotal = roomSelections.reduce((sum, selection) => {
    const mode = roomModes.find((room) => room.value === selection.roomMode);
    const multiplier = mode?.price_multiplier ?? 1;
    const peoplePerRoom = mode?.fixed_people ?? 1;
    return sum + experiencePricePerPerson * peoplePerRoom * multiplier * selection.quantity;
  }, 0);

  let roundtripTransferCost = 0;
  if (transportMode === 'roundtrip_transfer' && roundtripTransferConfig) {
    const peopleCount = roomSelections.reduce((sum, sel) => {
      const mode = roomModes.find((rm) => rm.value === sel.roomMode);
      return sum + (mode?.fixed_people ?? 1) * sel.quantity;
    }, 0);
    const vehicleCount = Math.ceil(
      Math.max(peopleCount, 1) / roundtripTransferConfig.maxPeoplePerVehicle,
    );
    roundtripTransferCost = vehicleCount * roundtripTransferConfig.pricePerVehicle;
  }

  const communityContributionAmount = communityContributionEnabled ? COMMUNITY_CONTRIBUTION_COP : 0;
  const total = roomTotal + roundtripTransferCost + communityContributionAmount;
  const depositAmount = Math.round(total * (depositPercent / 100));

  return {
    experiencePricePerPerson,
    total,
    depositPercent,
    depositAmount,
    roundtripTransferCost,
    communityContributionAmount,
  };
}

/**
 * Suggests the best-fit room selections for a given people count and tier.
 *
 * Strategy (scored in order):
 *   1. Minimise overshoot — exact capacity coverage is preferred over overshooting.
 *   2. Minimise number of rooms — fewer rooms means simpler booking.
 *
 * Uses a depth-limited DFS so the search space stays tiny even at max capacity (10 people).
 */
export function suggestRoomSelections(
  targetPeople: number,
  allRoomModes: RoomModeOption[],
  tierId: string | null
): RoomSelection[] {
  if (targetPeople <= 0) return [];

  const eligible = (tierId
    ? allRoomModes.filter((m) => m.tier_id === tierId)
    : allRoomModes
  ).filter((m) => (m.fixed_people ?? 0) > 0 && m.units_available > 0);

  if (!eligible.length) return [];

  // Largest rooms first — DFS finds good solutions faster and prunes earlier.
  const sorted = [...eligible].sort(
    (a, b) => (b.fixed_people ?? 0) - (a.fixed_people ?? 0)
  );

  let bestSelections: RoomSelection[] | null = null;
  let bestOvershoot = Infinity;
  let bestRooms = Infinity;

  const MAX_ROOMS = 6;

  function dfs(
    remaining: number,
    startIdx: number,
    unitsUsed: Map<string, number>,
    current: RoomSelection[],
    totalRooms: number
  ): void {
    if (totalRooms >= MAX_ROOMS) return;

    if (remaining <= 0) {
      const overshoot = -remaining;
      if (
        overshoot < bestOvershoot ||
        (overshoot === bestOvershoot && totalRooms < bestRooms)
      ) {
        bestSelections = current.map((r) => ({ ...r }));
        bestOvershoot = overshoot;
        bestRooms = totalRooms;
      }
      return;
    }

    for (let i = startIdx; i < sorted.length; i++) {
      const mode = sorted[i];
      const fp = mode.fixed_people ?? 0;
      const used = unitsUsed.get(mode.value) ?? 0;
      if (used >= mode.units_available) continue;

      const newUsed = new Map(unitsUsed);
      newUsed.set(mode.value, used + 1);

      const existingIdx = current.findIndex((s) => s.roomMode === mode.value);
      const newCurrent =
        existingIdx >= 0
          ? current.map((s, idx) =>
              idx === existingIdx ? { ...s, quantity: s.quantity + 1 } : s
            )
          : [...current, { roomMode: mode.value, quantity: 1 }];

      dfs(remaining - fp, i, newUsed, newCurrent, totalRooms + 1);
    }
  }

  dfs(targetPeople, 0, new Map(), [], 0);

  return bestSelections ?? [];
}
