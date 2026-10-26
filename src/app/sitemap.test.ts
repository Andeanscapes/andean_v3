import { describe, expect, it, vi } from 'vitest';

// Stub the catalog so the sitemap never reaches the live feed.
vi.mock('@/lib/services/experiences-catalog.service', () => ({
  getExperiencePathListSSR: vi.fn(async () => ['chivor-emerald-mine-tour']),
}));

import sitemap from './sitemap';

describe('sitemap', () => {
  it('lists only canonical apex URLs and no booking pages', async () => {
    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls.every((url) => url.startsWith('https://andeanscapes.com'))).toBe(true);
    expect(urls.some((url) => url.includes('/booking'))).toBe(false);
    expect(urls).toContain('https://andeanscapes.com/es/experiences/chivor-emerald-mine-tour');
  });

  it('uses slash-free locale homes that match the page canonicals', async () => {
    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls).toEqual(
      expect.arrayContaining([
        'https://andeanscapes.com',
        'https://andeanscapes.com/es',
        'https://andeanscapes.com/fr',
      ]),
    );
    expect(urls).not.toContain('https://andeanscapes.com/es/');
  });

  it('gives every entry hreflang alternates including x-default', async () => {
    for (const entry of await sitemap()) {
      const languages = entry.alternates?.languages ?? {};
      expect(Object.keys(languages).sort()).toEqual(['en', 'es', 'fr', 'x-default']);
    }
  });
});
