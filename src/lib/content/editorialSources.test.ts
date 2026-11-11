import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { GUIDES } from './guides.structure';
import { EMERALD_AUTHORS, EMERALD_PAGES } from './emeralds.structure';

/**
 * Editorial source policy for guides and Emerald World: never cite or link tour
 * operators, review/booking platforms, jewelers, auction houses or emerald
 * sellers. They are competitors or commercial parties, not evidence.
 *
 * Hosts are matched as a suffix, so subdomains are covered. Extend the list when
 * a new commercial domain appears in research.
 */
const BLOCKED_HOSTS: readonly string[] = [
  // Review and booking platforms.
  'tripadvisor.com',
  'tripadvisor.co',
  'viator.com',
  'getyourguide.com',
  'airbnb.com',
  'booking.com',
  'expedia.com',
  'civitatis.com',
  // Tour operators seen in emerald-tour search results.
  'colombianemeraldtours.com',
  'colombianemeraldtour.com',
  'colombiamotoadventures.com',
  'colombia-travels.com',
  'emeraldbylove.com',
  // Jewelers, gem retailers and auction houses.
  'sothebys.com',
  'christies.com',
  'bonhams.com',
  'jrcolombianemeralds.com',
  'gemselect.com',
  'emeraldsandjewelry.com',
  'thenaturalemeraldcompany.com',
  'cartier.com',
  'bulgari.com',
  'vancleefarpels.com',
  'harrywinston.com',
  'tiffany.com',
];

function isBlocked(url: string): boolean {
  const host = new URL(url).hostname.replace(/^www\./, '');
  return BLOCKED_HOSTS.some((blocked) => host === blocked || host.endsWith(`.${blocked}`));
}

const EMERALD_MESSAGES_DIR = path.resolve(__dirname, '../../i18n/messages/emeralds');

function emeraldMessageFiles(): string[] {
  return readdirSync(EMERALD_MESSAGES_DIR).flatMap((locale) =>
    readdirSync(path.join(EMERALD_MESSAGES_DIR, locale)).map((file) => path.join(EMERALD_MESSAGES_DIR, locale, file)),
  );
}

describe('editorial source policy', () => {
  it('flags blocked hosts and their subdomains only', () => {
    expect(isBlocked('https://www.tripadvisor.com/Attraction')).toBe(true);
    expect(isBlocked('https://es.tripadvisor.co/x')).toBe(true);
    expect(isBlocked('https://www.gia.edu/gems-gemology')).toBe(false);
  });

  it('cites no commercial source in guides or Emerald World', () => {
    const urls = [...GUIDES, ...EMERALD_PAGES].flatMap((page) =>
      page.sources.flatMap((source) => (source.url ? [source.url] : [])),
    );
    expect(urls.filter(isBlocked)).toEqual([]);
  });

  it('lists no commercial profile for an author', () => {
    expect(EMERALD_AUTHORS.flatMap((author) => author.sameAs).filter(isBlocked)).toEqual([]);
  });

  it('links no commercial site from Emerald World copy', () => {
    const urls = emeraldMessageFiles().flatMap((file) => readFileSync(file, 'utf8').match(/https?:\/\/[^\s"')]+/g) ?? []);
    expect(urls.filter(isBlocked)).toEqual([]);
  });
});
