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

/**
 * Keep in sync with `src/utils/mediaUrl.ts`: that module rewrites feed media
 * paths to absolute URLs on this origin, so `next/image` must be allowed to
 * optimize it. Deriving the pattern from the same variable means overriding
 * `NEXT_PUBLIC_CDN_BASE_URL` cannot produce an unconfigured-host runtime error.
 */
const CDN_BASE_URL =
  process.env.NEXT_PUBLIC_CDN_BASE_URL?.trim() || 'https://cdn.andeanscapes.com';

let cdnOrigin;
try {
  cdnOrigin = new URL(CDN_BASE_URL);
} catch {
  throw new Error(
    `NEXT_PUBLIC_CDN_BASE_URL is not a valid absolute URL: "${CDN_BASE_URL}"`,
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. ADDED: Image Optimization configuration for R2
  images: {
    remotePatterns: [
      {
        protocol: cdnOrigin.protocol.replace(':', ''),
        hostname: cdnOrigin.hostname,
        port: cdnOrigin.port,
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

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

  async headers() {
    const headers = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
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
    const removedRoutes = [
      '/email-form', '/home-dark', '/home-parallax', '/about', '/blog-details',
      '/blog-list', '/contact', '/destination-details', '/destinations',
      '/gallary', '/guides', '/package-details', '/package-details-2',
      '/package-list', '/package-sidebar'
    ];

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
