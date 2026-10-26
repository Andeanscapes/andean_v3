import { z } from 'zod';

/** Keep the legacy id until the pre-split feed is retired. IDs key persisted reservations. */
export const ExperienceIdSchema = z.enum([
  'chivorEmeraldCore',
  'chivorEmeraldBasic',
  'chivorEmeraldPrime',
  'coscuezEmeraldCore',
  'coscuezEmeraldPrime',
  'emeraldMining',
]);
export type ExperienceId = z.infer<typeof ExperienceIdSchema>;

export const PackageTagCodeSchema = z.enum(['allInclusive', 'dayTrip']);
export type PackageTagCode = z.infer<typeof PackageTagCodeSchema>;
