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
  "env": (config) => ({
    ...config,
    NEXT_PUBLIC_WS_DISABLED: "true",
  }),
  "staticDirs": [
    "../public"
  ],
  // Dev-only API access for stories (e.g. GET /dev/purchase-messages) without touching API CORS.
  viteFinal: (config) => ({
    ...config,
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