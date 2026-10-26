import { z } from 'zod';

/**
 * Plan tier and mine codes shared by the feed and UI schemas.
 *
 * Lives in its own leaf module for the same reason as `currency.schema.ts`:
 * `feed/v2/common.schema.ts` re-exports from `experience.schema.ts`, so a UI
 * schema that imports a domain code back from `common.schema.ts` creates a
 * circular dependency. The leaf keeps both sides importable without the cycle.
 */

/** Plan tier shown as a card/hero badge. Labels and colours are frontend-owned. */
export const PlanCodeSchema = z.enum(['basic', 'core', 'prime']);
export type PlanCode = z.infer<typeof PlanCodeSchema>;

/** Mine/location shown as a badge. Labels are frontend-owned. */
export const MineCodeSchema = z.enum(['chivor', 'coscuez']);
export type MineCode = z.infer<typeof MineCodeSchema>;
