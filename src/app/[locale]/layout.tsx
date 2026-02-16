import '@/styles/globals.css';
import 'swiper/css';

import {Jost, Playfair_Display, Satisfy} from 'next/font/google';
import Script from 'next/script';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {LanguageProvider} from '@/contexts/LanguageContext';
import {ThemeProvider} from '@/contexts/ThemeContext';
import MetaPixelPageViewTracker from '@/components/MetaPixelPageViewTracker/MetaPixelPageViewTracker';

import {locales, routing, type Locale} from '@/i18n/routing';

// Next.js replaces process.env.NEXT_PUBLIC_* at build time
const rawMetaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '';
const META_PIXEL_ID = /^[0-9]+$/.test(rawMetaPixelId) ? rawMetaPixelId : '';
const HAS_META_PIXEL = META_PIXEL_ID !== '';

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
        {/* TODO(security): When CSP is enforced, allow connect.facebook.net and nonce/hash this inline script. */}
        {HAS_META_PIXEL ? (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
                if (typeof console !== 'undefined') {
                  console.log('[Meta Pixel] Initialized with ID: ${META_PIXEL_ID}');
                }
              `}
            </Script>
            <noscript>
              <img
                alt=""
                height="1"
                width="1"
                style={{display: 'none'}}
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              />
            </noscript>
          </>
        ) : null}
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <LanguageProvider>
              {HAS_META_PIXEL ? <MetaPixelPageViewTracker /> : null}
              {children}
            </LanguageProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
