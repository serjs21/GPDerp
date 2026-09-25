"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import { STORY_CREATED_AT, withThemedStoryStage } from "@/storybook";
import { DateGraffiti } from "./DateGraffiti";
import styles from "./DateGraffiti.stories.module.css";

const meta = {
  title: "Haiku/DateGraffiti",
  component: DateGraffiti,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    initialCelestialPreset: "blueNight" satisfies CelestialPresetName,
  },
  decorators: [withThemedStoryStage],
  args: {
    date: STORY_CREATED_AT,
  },
} satisfies Meta<typeof DateGraffiti>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NumericDates: Story = {
  name: "Numeric dates",
  render: () => (
    <div className={styles.stage}>
      <p className={styles.caption}>DD.MM.YY · Flacucho</p>
      <div className={styles.row}>
        <DateGraffiti date={new Date(2026, 0, 15)} />
        <DateGraffiti date={new Date(2026, 5, 1)} />
        <DateGraffiti date={new Date(2026, 11, 31)} />
      </div>
    </div>
  ),
};

export const OnPaper: Story = {
  name: "On paper caption",
  render: () => (
    <div className={styles.paper}>
      <DateGraffiti date={new Date(2026, 2, 24)} />
    </div>
  ),
};

export const FixedSeed: Story = {
  name: "Fixed seed",
  args: {
    date: new Date(2026, 2, 24).toISOString(),
    seed: 77,
  },
};

export const BackgroundStamp: Story = {
  name: "Background stamp",
  render: () => (
    <div className={styles.stampHost}>
      <DateGraffiti
        date={new Date(2026, 2, 24)}
        color="color-mix(in srgb, #2d2d2d 22%, transparent)"
        size="2rem"
        position={{ right: "0.5rem", bottom: "0.4rem", transform: "rotate(-9deg)" }}
      />
      <span className={styles.stampForeground}>LABEL</span>
    </div>
  ),
};
