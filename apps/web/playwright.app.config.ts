import { defineConfig, devices } from "playwright/test";

const port = Number(process.env.APP_PORT ?? 3100);

/**
 * App-level specs against a production build (not Storybook). API calls are mocked per test.
 * Run: `pnpm test:playwright:app` (builds, then serves on APP_PORT, default 3100).
 */
export default defineConfig({
  testDir: "./tests/playwright-app",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `pnpm build && pnpm exec next start -p ${port}`,
    port,
    reuseExistingServer: true,
    timeout: 300_000,
  },
});
