/**
 * Single source of truth for raw experience data (mock era).
 *
 * PRODUCTION: Replace each entry with the corresponding API fetch.
 * Both book.service and experiences-list.service consume this registry,
 * so the migration to real endpoints happens in one place.
 *
 * To add a new experience: import its mock and add one entry below.
 */

import type { ExperienceData } from '../schemas';
import { EMERALD_MINING_DATA } from './emeraldMining.booking.mock';

export const EXPERIENCE_DATA_REGISTRY: Record<string, ExperienceData> = {
  emeraldMining: EMERALD_MINING_DATA,
};
