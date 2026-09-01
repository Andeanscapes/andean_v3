/**
 * Form validation schemas for experiences.
 *
 * Messages are **i18n keys**, not copy. Zod messages must be plain strings, so
 * the schema cannot call `t` and stay pure — instead every message is a key under
 * `experiences.ui.validation.*`, and `resolveReservationError` translates it at
 * the point of display. Before this, the messages were Spanish literals shown to
 * en/fr users too.
 */

import { z } from 'zod';
import { RoomModeSchema, TransportModeSchema } from '@/lib/schemas/experience.schema';

/** Keys under the `experiences.ui` namespace the booking components already use. */
const KEY = {
  selectDate: 'validation.selectDate',
  peopleMin: 'validation.peopleMin',
  peopleMax: 'validation.peopleMax',
  roomRequired: 'validation.roomRequired',
  transportRequired: 'validation.transportRequired',
  termsRequired: 'validation.termsRequired',
  contactName: 'validation.contactName',
  contactPhone: 'validation.contactPhone',
  contactEmail: 'validation.contactEmail',
} as const;

/**
 * Party-size bounds. The feed owns these (`experience.capacity`), so the schema
 * is built per experience rather than hardcoding a limit that silently
 * contradicts the published capacity.
 */
export interface ReservationBounds {
  minPeople: number;
  maxPeople: number;
}

/** Fallback bounds for field-level checks with no experience in scope. */
const DEFAULT_BOUNDS: ReservationBounds = { minPeople: 1, maxPeople: 10 };

export function buildReservationSchema(bounds: ReservationBounds = DEFAULT_BOUNDS) {
  const { minPeople, maxPeople } = bounds;

  return z.object({
    selectedDateId: z.string().min(1, KEY.selectDate),

    peopleCount: z.number().min(minPeople, KEY.peopleMin).max(maxPeople, KEY.peopleMax),

    roomSelections: z
      .array(
        z.object({
          // Reuses the feed enum so a new room mode cannot be bookable in the UI
          // but rejected here.
          roomMode: RoomModeSchema,
          quantity: z.number().min(1).max(maxPeople),
        })
      )
      .min(1, KEY.roomRequired),

    // Options come from the feed enum — this previously re-listed three modes by
    // hand and omitted `roundtrip_transfer`, so transfer bookings passed every UI
    // step and then failed final validation.
    transportMode: z.enum(TransportModeSchema.options, { message: KEY.transportRequired }),

    contact: contactSchema,

    termsAccepted: z.boolean().refine((val) => val === true, {
      message: KEY.termsRequired,
    }),
  });
}

const contactSchema = z.object({
  name: z.string().min(2, KEY.contactName),
  phone: z.string().regex(/^\+?[\d\s\-()]{7,}$/, KEY.contactPhone),
  email: z.string().email(KEY.contactEmail).optional().or(z.literal('')),
});

/**
 * Turn a failed `parse` into a displayable message.
 *
 * `ZodError.message` is a JSON dump of every issue, so the booking UI previously
 * rendered a raw JSON array into the error banner. This takes the first issue's
 * key and translates it with the bounds the schema was built from.
 *
 * @param t Scoped to `experiences.ui` — the namespace both booking components use.
 */
export function resolveReservationError(
  error: unknown,
  t: (key: string, values?: Record<string, string | number>) => string,
  bounds: ReservationBounds,
): string {
  if (error instanceof z.ZodError) {
    const key = error.issues[0]?.message;
    if (key) return t(key, { min: bounds.minPeople, max: bounds.maxPeople });
  }
  return t('validationError');
}

/**
 * Default-bounded schema, kept for field-level validation where no experience is
 * in scope. Submission paths must use `buildReservationSchema(config)` so the
 * limit matches the published capacity.
 */
export const reservationSchema = buildReservationSchema();

export type ReservationFormData = z.infer<ReturnType<typeof buildReservationSchema>>;

export function validateReservationField(
  field: keyof ReservationFormData,
  value: unknown
): string | null {
  try {
    if (field === 'selectedDateId') {
      reservationSchema.shape.selectedDateId.parse(value);
    } else if (field === 'peopleCount') {
      reservationSchema.shape.peopleCount.parse(value);
    } else if (field === 'roomSelections') {
      reservationSchema.shape.roomSelections.parse(value);
    } else if (field === 'transportMode') {
      reservationSchema.shape.transportMode.parse(value);
    } else if (field === 'contact') {
      reservationSchema.shape.contact.parse(value);
    } else if (field === 'termsAccepted') {
      reservationSchema.shape.termsAccepted.parse(value);
    }
    return null;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return err.issues?.[0]?.message || 'Error de validación';
    }
    return 'Error de validación';
  }
}

export function flattenZodErrors(error: z.ZodError): Record<string, string> {
  return error.issues.reduce(
    (acc, err) => {
      const path = err.path.join('.');
      if (!acc[path]) {
        acc[path] = err.message;
      }
      return acc;
    },
    {} as Record<string, string>
  );
}

// Contact field validation with Spanish messages
export function validateContactField(
  field: 'name' | 'phone' | 'email',
  value: string
): string | null {
  try {
    if (field === 'name') {
      reservationSchema.shape.contact.shape.name.parse(value);
    } else if (field === 'phone') {
      reservationSchema.shape.contact.shape.phone.parse(value);
    } else if (field === 'email') {
      reservationSchema.shape.contact.shape.email.parse(value);
    }
    return null;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return err.issues?.[0]?.message || 'Error de validación';
    }
    return 'Error de validación';
  }
}
