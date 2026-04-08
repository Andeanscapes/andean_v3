import type { ExperienceData } from '../schemas';
import { getBookingDataSSR } from './book.service';
import {
  EXPERIENCES_CATALOG_MOCK,
  type ExperienceCatalogItem,
} from '../data-mocks/experiencesCatalog.mock';

/**
 * Return all available experiences for route generation and lookup.
 * Pattern: Fetch -> Validate -> Return
 */
export async function getExperiencesCatalogSSR(): Promise<readonly ExperienceCatalogItem[]> {
  // PRODUCTION: Replace this with API fetch + schema validation.
  return EXPERIENCES_CATALOG_MOCK;
}

/**
 * Return all route params to build dynamic paths.
 */
export async function getExperiencePathListSSR(): Promise<string[]> {
  const catalog = await getExperiencesCatalogSSR();
  return catalog.map((item) => item.experienceName);
}

/**
 * Resolve one experience from route segment (experience-name).
 */
export async function getExperienceByNameSSR(
  experienceName: string
): Promise<ExperienceCatalogItem | null> {
  const catalog = await getExperiencesCatalogSSR();
  return catalog.find((item) => item.experienceName === experienceName) ?? null;
}

/**
 * Fetch translated experience data by route segment.
 * Pattern: Resolve route -> Fetch booking data -> Return
 */
export async function getExperienceDataSSR(
  experienceName: string,
  locale: string
): Promise<ExperienceData> {
  const experience = await getExperienceByNameSSR(experienceName);

  if (!experience) {
    throw new Error(`No experience found for path: ${experienceName}`);
  }

  return getBookingDataSSR(experience.experienceId, locale);
}

/**
 * Fetch translated experience data by internal id.
 * Used by list services that already work with ids.
 */
export async function getExperienceDataByIdSSR(
  experienceId: string,
  locale: string
): Promise<ExperienceData> {
  return getBookingDataSSR(experienceId, locale);
}
