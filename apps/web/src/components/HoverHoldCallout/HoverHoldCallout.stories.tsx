"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import { withThemedStoryStage } from "@/storybook";
import { HoverHoldCallout } from "./HoverHoldCallout";
import styles from "./HoverHoldCallout.stories.module.css";

const TUNE_IN_DISABLED_PANEL_SRC = "/custom_cursor/tune_in_disabled_panel.png";

const meta = {
  title: "Haiku/HoverHoldCallout",
  component: HoverHoldCallout,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    initialCelestialPreset: "blueNight" satisfies CelestialPresetName,
  },
  decorators: [withThemedStoryStage],
} satisfies Meta<typeof HoverHoldCallout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TuneInDisabledPanel: Story = {
  name: "Tune-in disabled panel",
  render: () => (
    <div className={styles.stage}>
      <p className={styles.caption}>
        Hover to show · click to hold 3s · fade 0.2s
      </p>
      <HoverHoldCallout
        holdMs={3000}
        fadeMs={200}
        position={{
          left: "50%",
          top: "0.35rem",
          transform: "translate(-50%, calc(-100% - 0.35rem))",
        }}
        callout={
          <div className={styles.speechBubble}>
            There&apos;s no use in searching for me
          </div>
        }
        calloutClassName={styles.calloutSlot}
      >
        <button
          type="button"
          className={styles.tuneInTarget}
          aria-label="Tune in (unavailable)"
        >
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
      </HoverHoldCallout>
    </div>
  ),
};

export const CornerPosition: Story = {
  name: "Corner position",
  render: () => (
    <HoverHoldCallout
      holdMs={3000}
      fadeMs={200}
      position={{ right: "0.35rem", bottom: "0.35rem", transform: "none" }}
      callout={
        <div className={styles.speechBubble}>
          There&apos;s no use in searching for me
        </div>
      }
    >
      <button
        type="button"
        className={styles.tuneInTarget}
        aria-label="Tune in (unavailable)"
      >
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
    </HoverHoldCallout>
  ),
};
