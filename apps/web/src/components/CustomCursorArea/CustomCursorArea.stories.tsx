"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import { withThemedStoryStage } from "@/storybook";
import { CustomCursorArea } from "./CustomCursorArea";
import styles from "./CustomCursorArea.stories.module.css";

const TUNE_IN_DISABLED_PANEL_SRC = "/custom_cursor/tune_in_disabled_panel.png";

const meta = {
  title: "Haiku/CustomCursorArea",
  component: CustomCursorArea,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    initialCelestialPreset: "blueNight" satisfies CelestialPresetName,
  },
  decorators: [withThemedStoryStage],
} satisfies Meta<typeof CustomCursorArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StampCursor: Story = {
  name: "Stamp cursor",
  render: () => (
    <CustomCursorArea
      cursor={<span className={styles.stampCursor}>✦</span>}
      offsetX={-10}
      offsetY={-14}
    >
      <div className={styles.hoverCard}>
        <p className={styles.cardTitle}>Hover me</p>
        <p className={styles.cardBody}>A simple glyph follows the pointer.</p>
      </div>
    </CustomCursorArea>
  ),
};

export const InkDotCursor: Story = {
  name: "Ink-dot cursor",
  render: () => (
    <CustomCursorArea
      cursor={<span className={styles.inkDot} aria-hidden />}
      offsetX={-6}
      offsetY={-6}
    >
      <div className={styles.hoverStrip}>
        <span>Sweep across this strip</span>
      </div>
    </CustomCursorArea>
  ),
};

export const TuneInDisabledBubble: Story = {
  name: "Tune-in disabled bubble",
  render: () => (
    <CustomCursorArea
      cursor={
        <div className={styles.speechBubble}>
          There&apos;s no use in searching for me
        </div>
      }
      offsetX={18}
      offsetY={-12}
    >
      <button type="button" className={styles.tuneInTarget} aria-label="Tune in (unavailable)">
        {/* eslint-disable-next-line @next/next/no-img-element -- story asset from /public */}
        <img
          src={TUNE_IN_DISABLED_PANEL_SRC}
          alt=""
          width={220}
          height={120}
          className={styles.tuneInPanel}
          draggable={false}
        />
      </button>
    </CustomCursorArea>
  ),
};
