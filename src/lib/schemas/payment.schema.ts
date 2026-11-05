/**
 * Checkout request contract for `POST /api/payments/mercadopago`.
 *
 * Carries selections only, never an amount: the server re-prices every request
 * from the feed, so a tampered payload cannot change what the customer pays.
 */

import { z } from 'zod';
import { ExperienceIdSchema } from './experience-codes.schema';
import { RoomModeSchema, TransportModeSchema } from './experience.schema';

export const CheckoutRequestSchema = z
  .object({
    experienceId: ExperienceIdSchema,
    locale: z.string().min(2).max(5),
    selectedTierId: z.string().min(1).max(64).nullable(),
    selectedDateId: z.string().min(1).max(64),
    roomSelections: z
      .array(
        z
          .object({
            roomMode: RoomModeSchema,
            quantity: z.number().int().min(1).max(20),
          })
          .strict(),
      )
      .min(1)
      .max(10),
    transportMode: TransportModeSchema,
    contact: z
      .object({
        name: z.string().trim().min(2).max(100),
        phone: z.string().trim().min(7).max(30),
        email: z.string().trim().max(254),
      })
      .strict(),
    termsAccepted: z.literal(true),
  })
  .strict();

export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;

export const CheckoutResponseSchema = z.object({
  url: z.string().url(),
  /** Our `external_reference`; the booking tab polls status with it while checkout runs in another tab. */
  reference: z.string().uuid(),
});

export type CheckoutResponse = z.infer<typeof CheckoutResponseSchema>;

/** Our reference, carried in the return URL as `?ref=`. Always a UUID we generated. */
export const PaymentReferenceSchema = z.string().uuid();

/** Mercado Pago's numeric payment id, appended to the return URL as `?payment_id=`. */
export const MercadoPagoPaymentIdSchema = z.string().regex(/^\d{1,20}$/);

export const PaymentStatusResponseSchema = z.object({
  status: z.enum(['approved', 'pending', 'rejected', 'not_found']),
});

export type PaymentStatusResponse = z.infer<typeof PaymentStatusResponseSchema>;
