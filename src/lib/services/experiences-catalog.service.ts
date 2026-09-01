import type { ExperienceData } from '../schemas';
import { EXPERIENCE_METADATA_NAMESPACE } from '@/i18n/mappings/experience';
import { getBookingDataSSR } from './book.service';
import { fetchExperiencesListConfig, isPublished } from './experiences-list.service';

/**
 * One routable experience: the URL segment, the internal id its data file is
 * keyed by, and the i18n namespace used for page metadata.
 */
export interface ExperienceCatalogItem {
  experienceId: string;
  experienceName: string;
  metadataNamespace: string;
}

/**
 * Return all available experiences for route generation and lookup.
 *
 * Derived from the experiences list feed rather than a dedicated catalog
 * endpoint — the list already carries the id and slug, so a second endpoint
 * would be duplicated truth. Matches the target API contract, which has no
 * catalog endpoint.
 *
 * Only `published` experiences get a route: a draft or archived entry must not
 * be prerendered or listed in the sitemap.
 *
 * The SEO namespace is frontend-owned (`EXPERIENCE_METADATA_NAMESPACE`) — the v2
 * feed carries domain codes only, never i18n namespaces.
 *
 * Pattern: Fetch -> Validate -> Return. Throws if the feed is unavailable, so a
 * broken feed fails route generation loudly instead of publishing a partial
 * sitemap.
 */
export async function getExperiencesCatalogSSR(): Promise<readonly ExperienceCatalogItem[]> {
  const feed = await fetchExperiencesListConfig();

  return feed.experiences.filter(isPublished).map((entry) => ({
    experienceId: entry.id,
    experienceName: entry.slug,
    metadataNamespace: EXPERIENCE_METADATA_NAMESPACE[entry.id],
  }));
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
