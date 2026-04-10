import '@/styles/globals.css';
import 'swiper/css';

import {Inter} from 'next/font/google';
import Script from 'next/script';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {Providers} from '@/app/providers';

import {locales, routing, type Locale} from '@/i18n/routing';

// Next.js replaces process.env.NEXT_PUBLIC_* at build time
const rawMetaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '';
const META_PIXEL_ID = /^[0-9]+$/.test(rawMetaPixelId) ? rawMetaPixelId : '';
const META_PIXEL_DEV_OVERRIDE = process.env.NEXT_PUBLIC_ENABLE_META_PIXEL_IN_DEV === 'true';
const HAS_META_PIXEL = META_PIXEL_ID !== '' &&
  (process.env.NODE_ENV === 'production' || META_PIXEL_DEV_OVERRIDE);

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
        <Providers locale={locale} messages={messages} hasMetaPixel={HAS_META_PIXEL}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
