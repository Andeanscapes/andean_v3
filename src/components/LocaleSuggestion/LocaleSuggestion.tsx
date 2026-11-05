'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Languages, X } from 'lucide-react';
import { getPathname, usePathname } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { LOCALE_SUGGESTION_COPY } from '@/i18n/languages';
import {
  dismissSuggestion,
  getHomeRedirectLocale,
  getSavedLocale,
  isSuggestionDismissed,
  matchBrowserLocale,
  saveLocale,
} from '@/utils/localePreference';

type Suggestion = { locale: Locale; href: string };

/**
 * Offers the visitor's browser language after the page loads. Never redirects a
 * first visit: the server HTML depends only on the URL (edge cache), and Google
 * crawls in English, so a language redirect would hide /es and /fr from it.
 *
 * One exception: a visitor who already picked a language and opens the
 * unprefixed home (`/`) is sent to that language. Crawlers never have a saved
 * preference, and explicit /es or /fr links are always respected.
 */
export default function LocaleSuggestion() {
  const currentLocale = useLocale() as Locale;
  const pathname = usePathname();
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);

  useEffect(() => {
    const keepQuery = `${window.location.search}${window.location.hash}`;
    const saved = getSavedLocale();

    if (saved) {
      const redirectLocale = getHomeRedirectLocale(saved, currentLocale, pathname);
      if (redirectLocale) window.location.replace(`${getPathname({ href: '/', locale: redirectLocale })}${keepQuery}`);
      return;
    }
    if (isSuggestionDismissed()) return;

    const browserLocale = matchBrowserLocale(navigator.languages?.length ? navigator.languages : [navigator.language]);
    if (!browserLocale || browserLocale === currentLocale) return;

    setSuggestion({ locale: browserLocale, href: `${getPathname({ href: pathname, locale: browserLocale })}${keepQuery}` });
  }, [currentLocale, pathname]);

  if (!suggestion) return null;

  const copy = LOCALE_SUGGESTION_COPY[suggestion.locale];
  const close = () => {
    dismissSuggestion();
    setSuggestion(null);
  };

  return (
    <div
      role="region"
      aria-label={copy.question}
      lang={suggestion.locale}
      // Mobile: above the sticky booking bars (bottom-0, ~5rem) and the WhatsApp
      // button (bottom 5rem + h-12), so neither the button nor its focus is covered.
      // Desktop: centered, clear of the WhatsApp button at the right edge.
      className="fixed inset-x-3 bottom-[calc(8.5rem+env(safe-area-inset-bottom))] z-[60] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-base-content/10 bg-base-100 px-4 py-3 text-sm text-base-content shadow-lg md:bottom-6"
    >
      <Languages className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
      <p className="flex-1 leading-snug">{copy.question}</p>
      <a
        href={suggestion.href}
        hrefLang={suggestion.locale}
        onClick={() => saveLocale(suggestion.locale)}
        className="shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-content transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100"
      >
        {copy.accept}
      </a>
      <button
        type="button"
        onClick={close}
        aria-label={copy.dismiss}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base-content/70 transition-colors hover:bg-base-content/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
