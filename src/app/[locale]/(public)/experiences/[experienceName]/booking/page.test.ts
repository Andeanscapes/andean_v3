import { describe, expect, it, vi } from 'vitest';
import { createTranslator, type AbstractIntlMessages } from 'next-intl';
import fr from '@/i18n/messages/fr.json';

vi.mock('next-intl/server', () => ({
  getTranslations: async (options: { locale: string; namespace?: string }) =>
    createTranslator({ locale: options.locale, messages: fr as AbstractIntlMessages, namespace: options.namespace }),
}));

vi.mock('@/lib/services/experiences-catalog.service', () => ({
  getExperiencePathListSSR: vi.fn(async () => ['chivor-emerald-mine-tour']),
  getExperienceByNameSSR: vi.fn(async () => ({
    experienceId: 'chivorEmeraldCore',
    experienceName: 'chivor-emerald-mine-tour',
    metadataNamespace: 'ChivorEmeraldCore',
  })),
  getExperienceDataSSR: vi.fn(async () => ({
    config: { title: 'Mines de Chivor' },
    heroContent: { backgroundImageUrl: 'https://cdn.andeanscapes.com/images/experiences/chivor-emerald-core/hero.webp' },
  })),
}));

import { generateMetadata } from './page';

describe('booking page metadata', () => {
  it('reads as a booking when shared, keeps the shared URL and stays out of the index', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: 'fr', experienceName: 'chivor-emerald-mine-tour' }),
    });

    expect(metadata.title).toBe('Réserver : Mines de Chivor | Andean Scapes');
    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.alternates?.canonical).toBe('https://andeanscapes.com/fr/experiences/chivor-emerald-mine-tour');
    // No og:url, so a clicked card opens the exact shared booking URL.
    expect(metadata.openGraph).not.toHaveProperty('url');
    expect(metadata.openGraph).toMatchObject({ locale: 'fr_FR', alternateLocale: ['en_US', 'es_CO'] });
  });
});
