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
};

module.exports = nextConfig;