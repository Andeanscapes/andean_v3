import '@/styles/globals.css';

import type { Viewport } from 'next';
import {Inter} from 'next/font/google';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {Providers} from '@/app/providers';

import {locales, routing, type Locale} from '@/i18n/routing';

/* Configure Google Fonts - Apple 2026 Aesthetic */
// Single modern sans-serif: Inter - the closest to San Francisco
// Used by Apple alternatives, Stripe, Figma, GitHub
const inter = Inter({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  style: ['normal'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI'],
  adjustFontFallback: true,
  variable: '--font-inter'
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale: localeParam} = await params;
  const locale = (locales as readonly string[]).includes(localeParam)
    ? (localeParam as Locale)
    : routing.defaultLocale;

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${inter.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="antialiased">
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
