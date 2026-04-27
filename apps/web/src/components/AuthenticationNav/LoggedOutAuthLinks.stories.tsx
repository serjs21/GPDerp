import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";

import { AuthenticationProvider } from "@/app/providers/AuthenticationProvider";
import { AuthenticationVerificationProvider } from "@/app/providers/AuthenticationVerificationProvider";
import { LoggedOutAuthLinks, YinYangSegmentBackground, type AuthNavYinHovered } from "./LoggedOutAuthLinks";
import styles from "./style.module.css";

const shellDecorator = (Story: () => ReactNode) => (
  <div
    style={{
      padding: "2rem",
      minHeight: 140,
      background: "var(--background)",
      color: "var(--text-color)",
    }}
  >
    <Story />
  </div>
);

const authProviders = (Story: () => ReactNode) => (
  <AuthenticationProvider>
    <AuthenticationVerificationProvider>
      <Story />
    </AuthenticationVerificationProvider>
  </AuthenticationProvider>
);

/**
 * ## Where to find this in Storybook
 *
 * Sidebar: **Components → LoggedOutAuthLinks** (search “LoggedOutAuth” or “yin”).
 *
 * ## DOM hooks
 *
 * - `data-auth-yin-hover` / `data-auth-yin-phase` on the pill (`seam` \| `split`).
 * - `data-auth-yin-liquids` on the background SVG (`seam` \| `split`).
 * - Hover duration: `AUTH_NAV_YIN_HOVER_DUR_S`.
 */
const meta = {
  title: "Components/LoggedOutAuthLinks",
  component: LoggedOutAuthLinks,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Logged-out header pill (Login / Register). Yin–yang S seam morphs to a horizontal divider on hover (Motion). Default story uses real auth providers.",
      },
    },
  },
  decorators: [shellDecorator, authProviders],
} satisfies Meta<typeof LoggedOutAuthLinks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Default (full component)",
};

function BackgroundOnlyFrame({
  hovered,
  reduceMotion,
}: {
  hovered: AuthNavYinHovered;
  reduceMotion: boolean;
}) {
  return (
    <div
      className={styles.authNavYinYang}
      data-testid="auth-yin-pill-story-shell"
      data-auth-yin-hover={hovered ?? "idle"}
      data-auth-yin-phase={hovered ? "split" : "seam"}
      style={{ maxWidth: "22rem" }}
    >
      <div className={styles.authNavYinBackgroundWrap}>
        <YinYangSegmentBackground hovered={hovered} reduceMotion={reduceMotion} />
      </div>
      <div className={styles.authNavYinLinks} aria-hidden style={{ pointerEvents: "none" }} />
    </div>
  );
}

export const BackgroundIdle: Story = {
  name: "Background only (idle seam)",
  decorators: [shellDecorator],
  render: () => <BackgroundOnlyFrame hovered={null} reduceMotion={false} />,
};

export const BackgroundLoginHover: Story = {
  name: "Background only (login hover)",
  decorators: [shellDecorator],
  render: () => <BackgroundOnlyFrame hovered="login" reduceMotion={false} />,
};

export const BackgroundRegisterHover: Story = {
  name: "Background only (register hover)",
  decorators: [shellDecorator],
  render: () => <BackgroundOnlyFrame hovered="register" reduceMotion={false} />,
};

export const BackgroundReducedMotion: Story = {
  name: "Background only (reduced motion)",
  decorators: [shellDecorator],
  render: () => <BackgroundOnlyFrame hovered="login" reduceMotion />,
};
