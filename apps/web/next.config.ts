import { execSync } from "node:child_process";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/** Release reported with browser errors; source maps are uploaded under the same value. */
const appRelease = (() => {
  if (process.env.NEXT_PUBLIC_APP_RELEASE) return process.env.NEXT_PUBLIC_APP_RELEASE;
  try {
    return execSync("git rev-parse --short=12 HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "dev";
  }
})();

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Maps are uploaded to Better Stack and deleted before deploy (scripts/upload-sourcemaps.mjs).
  productionBrowserSourceMaps: true,
  // Client-safe Paddle Billing values (same names as apps/api/.env).
  // Inlined for the browser; never put API key / webhook secret here.
  env: {
    PADDLE_CLIENT_TOKEN: process.env.PADDLE_CLIENT_TOKEN ?? "",
    PADDLE_ENV: process.env.PADDLE_ENV ?? "sandbox",
    PADDLE_PRICE_ID_100_HAIKUS: process.env.PADDLE_PRICE_ID_100_HAIKUS ?? "",
    NEXT_PUBLIC_APP_RELEASE: appRelease,
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
