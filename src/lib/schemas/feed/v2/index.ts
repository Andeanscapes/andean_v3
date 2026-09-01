/**
 * V2 remote feed contracts.
 *
 * Exported names are suffixed `V2` so they cannot be confused with the v1
 * schemas in `src/lib/schemas/*` during the dual-version window — notably
 * `LandingFeedSchema` (v1) vs `LandingFeedV2Schema`.
 *
 * This module is intentionally NOT re-exported from `src/lib/schemas/index.ts`:
 * v1 and v2 must be imported explicitly at the adapter boundary.
 */
export * from './common.schema';
export * from './experience.schema';
export * from './experiences-list.schema';
export * from './landing.schema';
