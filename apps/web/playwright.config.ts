import { defineConfig, devices } from "playwright/test";

export default defineConfig({
  testDir: "./tests/playwright",
  ...(process.env.SNAPSHOT_AUTH_NAV
    ? {}
    : { testIgnore: ["**/auth-nav-hover-snapshots.spec.ts"] }),
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:6006",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm storybook --no-open",
    port: 6006,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
