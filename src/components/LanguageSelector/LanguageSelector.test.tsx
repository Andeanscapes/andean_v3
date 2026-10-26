import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { NextIntlClientProvider, useLocale } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { languages } from '@/i18n/languages';
import { locales, type Locale } from '@/i18n/routing';
import en from '@/i18n/messages/en.json';
import es from '@/i18n/messages/es.json';
import fr from '@/i18n/messages/fr.json';

const navigation = vi.hoisted(() => ({ pathname: '/' }));

vi.mock('next/navigation', async (importOriginal) => ({
  ...await importOriginal<typeof import('next/navigation')>(),
  usePathname: () => navigation.pathname,
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguageContext: () => ({
    currentLocale: useLocale(),
    availableLanguages: languages,
  }),
}));

vi.mock('@/contexts/LayoutContext', () => ({
  useLayoutContext: () => ({ variant: 'black', isSticky: false }),
}));

vi.mock('@/contexts/ThemeContext', () => ({
  useThemeContext: () => ({ theme: 'light' }),
}));

import LanguageSelector from './LanguageSelector';

const messages = { en, es, fr };
const labels = {
  en: 'Select language: English',
  es: 'Seleccionar idioma: Español',
  fr: 'Choisir la langue : Français',
};

function selector(locale: Locale, pathname = '/') {
  navigation.pathname = locale === 'en' ? pathname : `/${locale}${pathname === '/' ? '' : pathname}`;
  return (
    <NextIntlClientProvider locale={locale} messages={messages[locale]} timeZone="UTC">
      <LanguageSelector />
    </NextIntlClientProvider>
  );
}

describe('LanguageSelector', () => {
  afterEach(cleanup);

  it.each(locales)('includes canonical language links in server HTML from %s', (locale) => {
    for (const pathname of ['/', '/experiences', '/experiences/chivor-emerald-mine-tour']) {
      const document = new window.DOMParser().parseFromString(renderToString(selector(locale, pathname)), 'text/html');
      const trigger = document.querySelector('button');
      const disclosure = document.getElementById(trigger?.getAttribute('aria-controls') ?? '');

      expect(trigger?.getAttribute('aria-label')).toBe(labels[locale]);
      expect(disclosure?.hasAttribute('hidden')).toBe(true);
      expect(disclosure?.querySelectorAll('a')).toHaveLength(3);

      for (const language of languages) {
        const link = disclosure?.querySelector(`a[hreflang="${language.code}"]`);
        const expected = language.code === 'en'
          ? pathname
          : `/${language.code}${pathname === '/' ? '' : pathname}`;
        expect(link?.getAttribute('href')).toBe(expected);
        expect(link?.getAttribute('lang')).toBe(language.code);
        expect(link?.getAttribute('aria-current')).toBe(language.code === locale ? 'page' : null);
      }
    }
  });

  it.each(locales)('supports keyboard disclosure and focus restoration in %s', async (locale) => {
    const user = userEvent.setup();
    render(selector(locale, '/experiences'));
    const trigger = screen.getByRole('button', { name: labels[locale] });

    expect(screen.queryAllByRole('link')).toHaveLength(0);
    await user.tab();
    expect(trigger).toHaveFocus();
    await user.tab();
    expect(screen.getAllByRole('link', { hidden: true }).every((link) => link !== document.activeElement)).toBe(true);

    trigger.focus();
    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.tab();
    expect(screen.getByRole('link', { name: 'English' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryAllByRole('link')).toHaveLength(0);

    await user.keyboard(' ');
    await user.tab();
    await user.tab();
    await user.tab();
    await user.tab();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
