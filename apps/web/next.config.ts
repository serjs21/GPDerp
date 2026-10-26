import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Client-safe Paddle Billing values (same names as apps/api/.env).
  // Inlined for the browser; never put API key / webhook secret here.
  env: {
    PADDLE_CLIENT_TOKEN: process.env.PADDLE_CLIENT_TOKEN ?? "",
    PADDLE_ENV: process.env.PADDLE_ENV ?? "sandbox",
    PADDLE_PRICE_ID_100_HAIKUS: process.env.PADDLE_PRICE_ID_100_HAIKUS ?? "",
  },
  // Common policy URLs that site scanners guess; temporary (307) so removing them later isn't cached by browsers.
  async redirects() {
    return [
      { source: "/cookie-policy", destination: "/cookies", permanent: false },
      { source: "/privacy-policy", destination: "/privacy", permanent: false },
      { source: "/refund-policy", destination: "/refund", permanent: false },
      { source: "/terms-of-service", destination: "/terms", permanent: false },
      { source: "/acceptable-use-policy", destination: "/acceptable-use", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
export default withNextIntl(nextConfig);

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
