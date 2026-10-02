"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import { composeDecorators, withQueryClient, withThemedStoryStage } from "@/storybook";
import { AwkwardLantern } from "./AwkwardLantern";
import styles from "./AwkwardLantern.stories.module.css";

const meta: Meta<typeof AwkwardLantern> = {
  title: "Haiku/AwkwardLantern",
  component: AwkwardLantern,
  parameters: {
    layout: "fullscreen",
    initialCelestialPreset: "blueNight" satisfies CelestialPresetName,
  },
  decorators: [composeDecorators(withQueryClient, withThemedStoryStage)],
  argTypes: {
    widthRem: { control: { type: "range", min: 6, max: 24, step: 0.5 } },
  },
  render: (args) => (
    <div className={styles.stage}>
      <AwkwardLantern {...args} />
    </div>
  ),
};

export default meta;
type Story = StoryObj<typeof AwkwardLantern>;

export const Default: Story = {};

export const Large: Story = {
  args: { widthRem: 20 },
};
