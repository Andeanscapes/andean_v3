import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTranslator, type AbstractIntlMessages } from 'next-intl';
import en from '@/i18n/messages/en.json';
import { EXPERIENCE_METADATA_NAMESPACE } from '@/i18n/mappings/experience';
import { cloneFixture, EXPERIENCES_LIST_FIXTURE } from '@/test/fixtures';
import { SITE_INFO } from '@/constant/SiteConfig';

vi.mock('next-intl/server', () => ({
  getTranslations: async (options: { locale: string; namespace?: string }) =>
    createTranslator({ locale: options.locale, messages: en as AbstractIntlMessages, namespace: options.namespace }),
}));

import { GET } from './route';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('llms.txt', () => {
  it('lists published feed entries with translated descriptions and excludes drafts', async () => {
    const feed = cloneFixture(EXPERIENCES_LIST_FIXTURE);
    const draft = feed.experiences[0];
    draft.status = 'draft';
    vi.stubEnv('REMOTE_DATA_BASE_URL', 'https://cdn.andeanscapes.com/services');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(feed))));

    const response = await GET();
    const body = await response.text();
    expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
    expect(body).not.toContain(`/experiences/${draft.slug}`);
    const t = createTranslator({ locale: 'en', messages: en });
    for (const entry of feed.experiences.filter((item) => item.status === 'published')) {
      expect(body).toContain(`${SITE_INFO.url}/experiences/${entry.slug}`);
      expect(body).toContain(t(`${EXPERIENCE_METADATA_NAMESPACE[entry.id]}.metaDescription`));
    }
  });

  it('fails rather than publishing an empty catalog when the feed is unavailable', async () => {
    vi.stubEnv('REMOTE_DATA_BASE_URL', 'https://cdn.andeanscapes.com/services');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
    await expect(GET()).rejects.toThrow();
  });
});
