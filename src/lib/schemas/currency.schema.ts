/**
 * Currency primitives.
 *
 * Deliberately dependency-free. `feed/v2/common.schema.ts` re-exports the
 * booking enums *from* `experience.schema.ts`, so defining this in either of
 * those files makes them import each other and the module graph deadlocks at
 * evaluation time (`Cannot access 'CurrencyCodeSchema' before initialization`).
 * Both sides import this instead.
 */

import { z } from 'zod';

const CURRENCY_CODE = /^[A-Z]{3}$/;

/** ISO 4217 alphabetic code, uppercase. */
export const CurrencyCodeSchema = z
  .string()
  .regex(CURRENCY_CODE, 'Expected an uppercase ISO-4217 code');
