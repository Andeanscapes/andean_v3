/**
 * Zod schemas for single experience validation
 */

import { z } from 'zod';

// Room mode enum
export const RoomModeSchema = z.enum([
  'standard_single',
  'standard_couple',
  'family_single',
  'family_couple',
  'family_3',
  'cabin_single',
  'cabin_couple',
  'cabin_6',
]);

// Transport mode enum
export const TransportModeSchema = z.enum(['car_no_4x4', 'have_4x4', 'bus']);

// Room type enum
export const RoomTypeSchema = z.enum(['standard', 'family', 'cabin']);

// Experience config
export const ExperienceConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  description: z.string(),
  basePricePerPerson: z.number(),
  depositPercent: z.number(),
  maxPeople: z.number(),
  minPeople: z.number(),
  includesItems: z.array(z.string()),
  includesFullDetails: z.string(),
  microcopy: z.object({
    deposit: z.string(),
    balance: z.string(),
    security: z.string(),
    ctaPrimary: z.string(),
    ctaSecondary: z.string(),
  }),
});

// Transport option
export const TransportOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
  description: z.string(),
});

// Room mode option
export const RoomModeOptionSchema = z.object({
  value: RoomModeSchema,
  label: z.string(),
  price_multiplier: z.number(),
  fixed_people: z.number().optional(),
  room_type_id: RoomTypeSchema,
  units_available: z.number(),
});

// Available date
export const AvailableDateSchema = z.object({
  id: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  spots: z.number(),
  isAvailable: z.boolean(),
});

// Room selection
export const RoomSelectionSchema = z.object({
  roomMode: RoomModeSchema,
  quantity: z.number(),
});

// Reservation contact
export const ReservationContactSchema = z.object({
  name: z.string(),
  phone: z.string(),
  email: z.string(),
});

// Reservation pricing
export const ReservationPricingSchema = z.object({
  basePricePerPerson: z.number(),
  total: z.number(),
  depositPercent: z.number(),
  depositAmount: z.number(),
});

// Experience hero badge icon
export const ExperienceHeroBadgeIconSchema = z.enum(['limited', 'deposit', 'none']);

// Experience hero badge item
export const ExperienceHeroBadgeItemSchema = z.object({
  label: z.string(),
  icon: ExperienceHeroBadgeIconSchema.optional(),
});

// Experience hero content
export const ExperienceHeroContentSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  summary: z.string().optional(),
  highlightText: z.string().optional(),
  ctaLabel: z.string().optional(),
  helperText: z.string().optional(),
  hideCta: z.boolean().optional(),
  ctaTargetId: z.string().optional(),
  badges: z.array(ExperienceHeroBadgeItemSchema).optional(),
});

// Reservation state
export const ReservationStateSchema = z.object({
  // Date selection
  selectedDateId: z.string().nullable(),
  selectedDateLabel: z.string().nullable(),
  availableSpots: z.number().nullable(),

  // People
  peopleCount: z.number(),
  roomSelections: z.array(RoomSelectionSchema),

  // Transport
  transportMode: TransportModeSchema.nullable(),

  // Contact
  contact: ReservationContactSchema,

  // Terms
  termsAccepted: z.boolean(),

  // Pricing
  pricing: ReservationPricingSchema,

  // SSR hydration flag
  isHydrated: z.boolean(),
});

// Complete experience data
export const ExperienceDataSchema = z.object({
  config: ExperienceConfigSchema,
  transportOptions: z.array(TransportOptionSchema),
  roomModes: z.array(RoomModeOptionSchema),
  availableDates: z.array(AvailableDateSchema),
  whatsappLink: z.string(),
  heroContent: ExperienceHeroContentSchema.optional(),
});

// Export inferred TypeScript types
export type RoomMode = z.infer<typeof RoomModeSchema>;
export type TransportMode = z.infer<typeof TransportModeSchema>;
export type RoomType = z.infer<typeof RoomTypeSchema>;
export type ExperienceConfig = z.infer<typeof ExperienceConfigSchema>;
export type TransportOption = z.infer<typeof TransportOptionSchema>;
export type RoomModeOption = z.infer<typeof RoomModeOptionSchema>;
export type AvailableDate = z.infer<typeof AvailableDateSchema>;
export type RoomSelection = z.infer<typeof RoomSelectionSchema>;
export type ReservationContact = z.infer<typeof ReservationContactSchema>;
export type ReservationPricing = z.infer<typeof ReservationPricingSchema>;
export type ExperienceHeroBadgeIcon = z.infer<typeof ExperienceHeroBadgeIconSchema>;
export type ExperienceHeroBadgeItem = z.infer<typeof ExperienceHeroBadgeItemSchema>;
export type ExperienceHeroContent = z.infer<typeof ExperienceHeroContentSchema>;
export type ReservationState = z.infer<typeof ReservationStateSchema>;
export type ExperienceData = z.infer<typeof ExperienceDataSchema>;

// Reservation actions (discriminated union - not validated at runtime, but typed)
export type ReservationAction =
  | {
      type: 'SET_DATE';
      payload: { id: string; label: string; spots: number };
    }
  | { type: 'SET_ROOM_SELECTIONS'; payload: RoomSelection[] }
  | { type: 'SET_TRANSPORT'; payload: TransportMode }
  | {
      type: 'SET_CONTACT';
      payload: { field: 'name' | 'phone' | 'email'; value: string };
    }
  | { type: 'SET_TERMS'; payload: boolean }
  | { type: 'HYDRATE'; payload: Partial<ReservationState> }
  | { type: 'RESET' };

// Reservation context value
export interface ReservationContextValue {
  state: ReservationState;
  dispatch: (action: ReservationAction) => void;
  roomModes: RoomModeOption[];
}
