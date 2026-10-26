/**
 * Unit coverage for the cross-file visibility gate. Pure — no network, no
 * `fixtures/`.
 */

import { describe, expect, it } from 'vitest';
import { findStatusIssues, type FeedStatusInput } from './feed-status';

const PUBLISHED: FeedStatusInput = {
  list: [
    { id: 'chivorEmeraldCore', status: 'published' },
    { id: 'coscuezEmeraldCore', status: 'draft' },
  ],
  landing: {
    experiences: [
      { id: 'chivorEmeraldCore', status: 'published' },
      { id: 'coscuezEmeraldCore', status: 'draft' },
    ],
    featuredExperienceIds: ['chivorEmeraldCore'],
  },
  experiences: [
    { id: 'chivorEmeraldCore', status: 'published' },
    { id: 'coscuezEmeraldCore', status: 'draft' },
  ],
};

describe('findStatusIssues', () => {
  it('accepts a draft hidden consistently in every file', () => {
    expect(findStatusIssues(PUBLISHED)).toEqual([]);
  });

  it('flags an experience file that disagrees with the list', () => {
    const issues = findStatusIssues({
      ...PUBLISHED,
      experiences: [{ id: 'coscuezEmeraldCore', status: 'published' }],
    });
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain('coscuezEmeraldCore');
  });

  it('flags a landing entry still published while the list hides it', () => {
    const issues = findStatusIssues({
      ...PUBLISHED,
      landing: {
        experiences: [{ id: 'coscuezEmeraldCore', status: 'published' }],
        featuredExperienceIds: ['chivorEmeraldCore'],
      },
    });
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain('landing.json');
  });

  it('flags a featured id that is not published in the list', () => {
    const issues = findStatusIssues({
      ...PUBLISHED,
      landing: {
        experiences: PUBLISHED.landing?.experiences ?? [],
        featuredExperienceIds: ['chivorEmeraldCore', 'coscuezEmeraldCore'],
      },
    });
    expect(issues).toEqual([expect.stringContaining('featuredExperienceIds "coscuezEmeraldCore"')]);
  });

  it('flags a featured id absent from the list', () => {
    const issues = findStatusIssues({
      ...PUBLISHED,
      landing: {
        experiences: [],
        featuredExperienceIds: ['coscuezEmeraldPrime'],
      },
    });
    expect(issues).toEqual([expect.stringContaining('(absent)')]);
  });

  it('skips landing checks when landing is unavailable', () => {
    expect(findStatusIssues({ ...PUBLISHED, landing: undefined })).toEqual([]);
  });
});
