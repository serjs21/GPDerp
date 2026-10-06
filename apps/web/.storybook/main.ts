import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs"
  ],
  "framework": "@storybook/nextjs-vite",
  "staticDirs": [
    "../public"
  ],
  // Dev-only API access for stories (e.g. GET /dev/purchase-messages) without touching API CORS.
  viteFinal: (config) => ({
    ...config,
    // The nextjs-vite framework only defines NEXT_PUBLIC_* from .env files, so `env` above never reaches the bundle.
    define: {
      ...config.define,
      "process.env.NEXT_PUBLIC_WS_DISABLED": JSON.stringify("true"),
    },
    server: {
      ...config.server,
      proxy: {
        ...config.server?.proxy,
        "/dev-api": {
          target: process.env.STORYBOOK_API_URL ?? "http://localhost:4000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/dev-api/, ""),
        },
      },
    },
  }),
};
export default config;