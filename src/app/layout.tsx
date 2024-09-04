import '@/styles/globals.css';
import { Jost, Playfair_Display, Satisfy } from 'next/font/google';

import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';

// Import Swiper styles
import 'swiper/css';

/*Configure Google Fonts*/
const jost = Jost({
  weight: ['200', '300', '400', '500', '600', '700'],
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-jost'
})
const playfairDisplay = Playfair_Display({
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-playfair'
})
const satisfy = Satisfy({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-satisfy'
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
    const locale = await getLocale();
    const messages = await getMessages();

  return (
    <html lang={locale} className={`${jost.variable} ${playfairDisplay.variable} ${satisfy.variable}`}>
      <body>
      <NextIntlClientProvider messages={messages}>
        {children}
      </NextIntlClientProvider>
      </body>
    </html>
  )
}
