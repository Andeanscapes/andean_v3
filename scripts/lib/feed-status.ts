/**
 * Cross-file visibility checks shared by `verify-feed` and `feed:sync`.
 *
 * `status` is the only switch that hides an experience. `experiences-list.json`
 * owns routing, so it is the reference; `landing.json` and each
 * `experience-<id>.json` must agree with it, or a featured card links to a 404
 * or a detail page renders for a hidden experience.
 *
 * Pure: callers pass already-validated payloads and decide how to report.
 */
import type { PublicationStatus } from '../../src/lib/schemas/feed/v2';

interface StatusEntry {
  readonly id: string;
  readonly status: PublicationStatus;
}

export interface FeedStatusInput {
  readonly list: readonly StatusEntry[];
  readonly landing?: {
    readonly experiences: readonly StatusEntry[];
    readonly featuredExperienceIds: readonly string[];
  };
  readonly experiences: readonly StatusEntry[];
}

export function findStatusIssues({ list, landing, experiences }: FeedStatusInput): string[] {
  const listStatus = new Map(list.map((entry) => [entry.id, entry.status]));
  const issues: string[] = [];

  const compare = (source: string, entry: StatusEntry) => {
    const expected = listStatus.get(entry.id);
    if (expected !== undefined && expected !== entry.status) {
      issues.push(
        `${source}: "${entry.id}" status "${entry.status}" disagrees with ` +
          `experiences-list.json ("${expected}")`,
      );
    }
  };

  for (const entry of experiences) compare(`experience "${entry.id}"`, entry);

  if (landing) {
    for (const entry of landing.experiences) compare('landing.json', entry);

    for (const id of landing.featuredExperienceIds) {
      const status = listStatus.get(id);
      if (status !== 'published') {
        issues.push(
          `landing.json: featuredExperienceIds "${id}" is not published in ` +
            `experiences-list.json (${status ?? 'absent'}) — remove it`,
        );
      }
    }
  }

  return issues;
}
