import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.7"],
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core", "@resvg/resvg-js"],
  outputFileTracingIncludes: {
    "/api/signal-card": ["./lib/signal-cards/fonts/**"],
  },
  async redirects() {
    return [
      {
        source: "/articles/:slug.html",
        destination: "/articles/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
