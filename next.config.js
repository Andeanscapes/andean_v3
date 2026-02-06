const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

if (process.env.NODE_ENV === 'development') {
  try {
    const { initOpenNextCloudflareForDev } = require('@opennextjs/cloudflare');
    initOpenNextCloudflareForDev();
  } catch {
    // no-op: OpenNext dev integration is optional
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep Next.js in server mode (no `next export`) so Cloudflare Pages can serve
  // Next routes like `/_next/*` (required for <Image /> optimization and future server features).

  // Fix dev warning: "Cross origin request detected ... you will need to explicitly configure allowedDevOrigins"
  // Add comma-separated origins to NEXT_ALLOWED_DEV_ORIGINS if your LAN IP changes often.
  allowedDevOrigins:
    process.env.NODE_ENV === "development"
      ? [
          "http://localhost:3000",
          "http://127.0.0.1:3000",
          ...(process.env.NEXT_ALLOWED_DEV_ORIGINS
            ? process.env.NEXT_ALLOWED_DEV_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
            : []),
        ]
      : undefined,

  reactStrictMode: true,
  poweredByHeader: false,

  async headers() {
    const headers = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      // Lock down powerful features by default; loosen only when needed.
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), payment=(), usb=()' }
    ];

    if (process.env.NODE_ENV === 'production') {
      headers.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload'
      });
    }

    return [
      {
        source: '/:path*',
        headers
      }
    ];
  },

  async redirects() {
    // Keep nav links in existing template components from 404'ing after route cleanup.
    // These are TEMP redirects so you can reintroduce routes later without fighting caches.
    const removedRoutes = [
      '/email-form',
      '/home-dark',
      '/home-parallax',
      '/about',
      '/blog-details',
      '/blog-list',
      '/contact',
      '/destination-details',
      '/destinations',
      '/gallary',
      '/guides',
      '/package-details',
      '/package-details-2',
      '/package-list',
      '/package-sidebar'
    ];

    // Since routes now live under `app/[locale]`, requests can resolve as `/en/...` or `/es/...`
    // (depending on localePrefix + middleware). Redirect both the unprefixed and prefixed forms.
    const locales = ['en', 'es', 'fr'];

    return [
      ...removedRoutes.map((source) => ({
        source,
        destination: '/',
        permanent: false
      })),
      ...removedRoutes.flatMap((source) =>
        locales.map((locale) => ({
          source: `/${locale}${source}`,
          destination: locale === 'en' ? '/' : `/${locale}`,
          permanent: false
        }))
      )
    ];
  },
};

module.exports = withNextIntl(nextConfig);
