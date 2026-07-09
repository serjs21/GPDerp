import type { Decorator } from "@storybook/nextjs-vite";

/** Full-viewport shell for fullscreen Storybook layouts. */
export const withFullscreenShell: Decorator = (Story) => (
  <div style={{ minHeight: "100dvh", width: "100%" }}>
    <Story />
  </div>
);
