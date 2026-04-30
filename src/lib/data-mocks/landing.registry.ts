/**
 * Single source of truth for landing page raw data (mock era).
 *
 * PRODUCTION: Replace the default entry with an API fetch:
 * const raw = await fetch(`${API_BASE_URL}/api/v1/landing`).then(r => r.json());
 */

import type { LandingDataMock } from '../schemas/landing.schema';
import { LANDING_MOCK } from './landing.mock';

export const LANDING_DATA_REGISTRY: Record<string, LandingDataMock> = {
  default: LANDING_MOCK,
};
