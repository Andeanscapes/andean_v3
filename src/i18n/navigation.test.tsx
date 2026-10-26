import type { ReactNode } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { createTranslator, NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';
import LandingCategoryCard from '@/components/LandingCategories/LandingCategoryCard';
import { CATEGORIES_FIXTURE } from '@/components/LandingCategories/__fixtures__/categoriesFixture';
import { PrimaryCtaButton } from '@/components/ui/Button/PrimaryCtaButton';
import ExpericeWidget from '@/components/ExpericeWidget/ExpericeWidget';
import MobileStickyBookingBar from '@/app/[locale]/(public)/experiences/[experienceName]/MobileStickyBookingBar';
import { ExperienceDetailProvider } from '@/contexts/ExperienceDetailContext';
import { EXPERIENCE_I18N } from '@/i18n/mappings/experience';
import en from '@/i18n/messages/en.json';
import es from '@/i18n/messages/es.json';
import fr from '@/i18n/messages/fr.json';
import { EXPERIENCE_FIXTURE, cloneFixture } from '@/test/fixtures';
import { adaptExperienceFeedV2 } from '@/utils/experienceFeedAdapter';
import { toWidgetContent } from '@/utils/experienceTranslators';
import { createDetailSelectionStorage } from '@/utils/reservationStorage';
import { whatsappUrl } from '@/utils/whatsapp';
import type { Locale } from './routing';

const navigation = vi.hoisted(() => ({ pathname: '/' }));

vi.mock('next/navigation', () => ({
  permanentRedirect: vi.fn(),
  redirect: vi.fn(),
  usePathname: () => navigation.pathname,
  useRouter: () => ({
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock('@/contexts/ThemeContext', () => ({
  useThemeContext: () => ({ theme: 'light' }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const CATEGORY = CATEGORIES_FIXTURE.items[0];

function renderLinks(locale: Locale) {
  return render(
    <NextIntlClientProvider locale={locale} messages={{}}>
      <LandingCategoryCard category={CATEGORY} />
      <PrimaryCtaButton href="/experiences/test-experience/booking">
        Book
      </PrimaryCtaButton>
    </NextIntlClientProvider>,
  );
}

describe('localized navigation', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
    navigation.pathname = '/';
  });

  it.each([
    ['en', CATEGORY.href, '/experiences/test-experience/booking'],
    ['es', `/es${CATEGORY.href}`, '/es/experiences/test-experience/booking'],
    ['fr', `/fr${CATEGORY.href}`, '/fr/experiences/test-experience/booking'],
  ] as const)('localizes card and CTA links for %s', (locale, cardHref, bookingHref) => {
    renderLinks(locale);

    expect(screen.getByRole('link', { name: new RegExp(CATEGORY.title, 'i') })).toHaveAttribute(
      'href',
      cardHref,
    );
    expect(screen.getByRole('link', { name: 'Book' })).toHaveAttribute('href', bookingHref);
  });

  it.each(['en', 'es', 'fr'] as const)('keeps one locale prefix and booking selections in both CTAs for %s', (locale) => {
    const feed = cloneFixture(EXPERIENCE_FIXTURE);
    const messages = { en, es, fr }[locale];
    const t = createTranslator({ locale, messages });
    const experienceData = adaptExperienceFeedV2(feed, EXPERIENCE_I18N[feed.experience.id], whatsappUrl());
    experienceData.widgetContent = toWidgetContent(
      (key, values) => t(key as Parameters<typeof t>[0], values),
      feed.reviews.length,
    );
    const detailPath = `/experiences/${feed.experience.slug}`;
    navigation.pathname = locale === 'en' ? detailPath : `/${locale}${detailPath}`;
    const selectedTierId = experienceData.accommodationTiers?.[0]?.id ?? null;
    const selectedDateId = experienceData.availableDates[0]?.id ?? null;
    const peopleCount = Math.min(3, experienceData.config.maxPeople);
    createDetailSelectionStorage(experienceData.config.id).saveToStorage({
      selectedTierId,
      selectedDateId,
      peopleCount,
      transportMode: 'roundtrip_transfer',
      roundtripTransferRequested: true,
      isHydrated: true,
    });

    render(
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
        <ExperienceDetailProvider experienceData={experienceData}>
          <ExpericeWidget experienceData={experienceData} />
          <MobileStickyBookingBar experienceData={experienceData} />
        </ExperienceDetailProvider>
      </NextIntlClientProvider>,
    );

    const links = screen.getAllByRole('link', { name: t('experiences.ui.experienceDetails.bookNowBtn') });
    expect(links).toHaveLength(2);
    for (const link of links) {
      const url = new URL(link.getAttribute('href') ?? '', 'https://andeanscapes.com');
      expect(url.pathname).toBe(`${navigation.pathname}/booking`);
      expect(url.searchParams.get('tier')).toBe(selectedTierId);
      expect(url.searchParams.get('date')).toBe(selectedDateId);
      expect(url.searchParams.get('people')).toBe(String(peopleCount));
      expect(url.searchParams.get('transport')).toBe('roundtrip_transfer');
    }
  });
});
