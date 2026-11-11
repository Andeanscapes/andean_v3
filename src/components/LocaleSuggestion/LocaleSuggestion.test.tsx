import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Locale } from '@/i18n/routing';
import LocaleSuggestion from './LocaleSuggestion';

const navigation = vi.hoisted(() => ({ pathname: '/' }));

vi.mock('next/navigation', async (importOriginal) => ({
  ...await importOriginal<typeof import('next/navigation')>(),
  usePathname: () => navigation.pathname,
}));

function renderAt(locale: Locale, pathname: string, browserLanguages: string[]) {
  navigation.pathname = pathname;
  vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(browserLanguages);
  return render(
    <NextIntlClientProvider locale={locale} messages={{}}>
      <LocaleSuggestion />
    </NextIntlClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe('LocaleSuggestion', () => {
  it('offers Spanish, in Spanish, to a Spanish browser on the English page', async () => {
    renderAt('en', '/guides', ['es-CO', 'es']);

    const region = await screen.findByRole('region', { name: '¿Prefieres ver este sitio en español?' });
    expect(region).toHaveAttribute('lang', 'es');
    expect(screen.getByRole('link', { name: 'Ver en español' })).toHaveAttribute('href', '/es/guides');
  });

  it('offers French on a Spanish page to a French browser', async () => {
    renderAt('es', '/es/experiences', ['fr-FR']);
    expect(await screen.findByRole('link', { name: 'Voir en français' })).toHaveAttribute('href', '/fr/experiences');
  });

  it.each([
    ['the browser matches the page', 'en', '/', ['en-US']],
    ['the browser language is unsupported', 'en', '/', ['pt-BR']],
  ] as const)('stays hidden when %s', (_label, locale, pathname, languages) => {
    renderAt(locale, pathname, [...languages]);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('stays hidden once dismissed', async () => {
    const user = userEvent.setup();
    const { unmount } = renderAt('en', '/', ['es-CO']);
    await user.click(await screen.findByRole('button', { name: 'No, gracias' }));
    expect(screen.queryByRole('region')).not.toBeInTheDocument();

    unmount();
    renderAt('en', '/', ['es-CO']);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('sends a returning Spanish visitor from the home to /es, but not from inner pages', () => {
    const replace = vi.fn();
    vi.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, search: '', hash: '', replace });
    window.localStorage.setItem('andean.locale', 'es');

    const { unmount } = renderAt('en', '/', ['en-US']);
    expect(replace).toHaveBeenCalledWith('/es');
    unmount();

    replace.mockClear();
    renderAt('en', '/guides', ['en-US']);
    expect(replace).not.toHaveBeenCalled();
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('saves the language when the suggestion is accepted', async () => {
    renderAt('en', '/guides', ['es-CO']);
    const link = await screen.findByRole('link', { name: 'Ver en español' });
    link.addEventListener('click', (event) => event.preventDefault());
    await userEvent.setup().click(link);
    expect(window.localStorage.getItem('andean.locale')).toBe('es');
  });
});
