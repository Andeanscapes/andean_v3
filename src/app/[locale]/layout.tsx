import '@/styles/globals.css';
import 'swiper/css';

import {Jost, Playfair_Display, Satisfy} from 'next/font/google';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {LanguageProvider} from '@/contexts/LanguageContext';
import {ThemeProvider} from '@/contexts/ThemeContext';

import {locales, routing, type Locale} from '@/i18n/routing';

/* Configure Google Fonts */
const jost = Jost({
  weight: ['200', '300', '400', '500', '600', '700'],
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'Arial'],
  adjustFontFallback: true,
  variable: '--font-jost'
});
const playfairDisplay = Playfair_Display({
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['Georgia', 'serif'],
  adjustFontFallback: true,
  variable: '--font-playfair'
});
const satisfy = Satisfy({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['cursive'],
  variable: '--font-satisfy'
});

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
      className={`${jost.variable} ${playfairDisplay.variable} ${satisfy.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="antialiased">
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <LanguageProvider>
              {children}
            </LanguageProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


