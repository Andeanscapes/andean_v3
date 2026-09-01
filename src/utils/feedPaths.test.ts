import { describe, it, expect } from 'vitest';
import {
  EXPERIENCES_LIST_FEED_FILE,
  EXPERIENCES_LIST_FEED_PATH,
  LANDING_FEED_FILE,
  LANDING_FEED_PATH,
  experienceFeedFile,
  experienceFeedPath,
} from './feedPaths';

describe('experienceFeedFile', () => {
  it('kebab-cases a camelCase experience id', () => {
    expect(experienceFeedFile('emeraldMining')).toBe('experience-emerald-mining.json');
  });

  it('leaves an already-kebab id untouched', () => {
    expect(experienceFeedFile('emerald-mining')).toBe('experience-emerald-mining.json');
  });

  it('handles multiple humps and digits', () => {
    expect(experienceFeedFile('ancestralPottery2Day')).toBe(
      'experience-ancestral-pottery2-day.json',
    );
  });

  it('normalises underscores and spaces', () => {
    expect(experienceFeedFile('emerald_mining')).toBe('experience-emerald-mining.json');
    expect(experienceFeedFile('emerald mining')).toBe('experience-emerald-mining.json');
  });

  it('collapses repeated separators', () => {
    expect(experienceFeedFile('emerald__mining')).toBe('experience-emerald-mining.json');
  });

  it('never collides with the plural feed files', () => {
    // A card id of "list" must not produce experiences-list.json.
    expect(experienceFeedFile('list')).toBe('experience-list.json');
    expect(experienceFeedFile('list')).not.toBe('experiences-list.json');
  });
});

describe('fixed feed files', () => {
  it('names the two files the published feed must expose', () => {
    // Pinned literals on purpose: these are the wire contract, so a rename has
    // to be a deliberate edit here rather than a silent drift in one caller.
    expect(LANDING_FEED_FILE).toBe('landing.json');
    expect(EXPERIENCES_LIST_FEED_FILE).toBe('experiences-list.json');
  });

  it('derives each request path from its filename', () => {
    expect(LANDING_FEED_PATH).toBe(`/${LANDING_FEED_FILE}`);
    expect(EXPERIENCES_LIST_FEED_PATH).toBe(`/${EXPERIENCES_LIST_FEED_FILE}`);
  });

  it('cannot be produced by an experience id', () => {
    // `experiences-list.json` sitting in the same namespace as the per-experience
    // files is the collision worth guarding.
    for (const id of ['list', 'landing', 'experiencesList']) {
      expect(experienceFeedFile(id)).not.toBe(EXPERIENCES_LIST_FEED_FILE);
      expect(experienceFeedFile(id)).not.toBe(LANDING_FEED_FILE);
    }
  });
});

describe('experienceFeedPath', () => {
  it('is the filename as a root-relative request path', () => {
    expect(experienceFeedPath('emeraldMining')).toBe('/experience-emerald-mining.json');
  });

  it('stays in sync with experienceFeedFile', () => {
    // Guards the reader/writer drift this helper exists to prevent.
    for (const id of ['emeraldMining', 'ancestralPottery', 'some_other-Id']) {
      expect(experienceFeedPath(id)).toBe(`/${experienceFeedFile(id)}`);
    }
  });
});
