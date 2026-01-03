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

  async redirects() {
    // Keep nav links in existing template components from 404'ing after route cleanup.
    // These are TEMP redirects so you can reintroduce routes later without fighting caches.
    return [
      { source: "/email-form", destination: "/", permanent: false },
      { source: "/home-dark", destination: "/", permanent: false },
      { source: "/home-parallax", destination: "/", permanent: false },

      { source: "/about", destination: "/", permanent: false },
      { source: "/blog-details", destination: "/", permanent: false },
      { source: "/blog-list", destination: "/", permanent: false },
      { source: "/contact", destination: "/", permanent: false },
      { source: "/destination-details", destination: "/", permanent: false },
      { source: "/destinations", destination: "/", permanent: false },
      { source: "/gallary", destination: "/", permanent: false },
      { source: "/guides", destination: "/", permanent: false },
      { source: "/package-details", destination: "/", permanent: false },
      { source: "/package-details-2", destination: "/", permanent: false },
      { source: "/package-list", destination: "/", permanent: false },
      { source: "/package-sidebar", destination: "/", permanent: false },
    ];
  },
};

module.exports = nextConfig;