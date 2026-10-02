"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import { composeDecorators, withQueryClient, withThemedStoryStage } from "@/storybook";
import { NotFoundView } from "./NotFoundView";

const meta: Meta<typeof NotFoundView> = {
  title: "Haiku/NotFoundView",
  component: NotFoundView,
  parameters: {
    layout: "fullscreen",
    initialCelestialPreset: "blueNight" satisfies CelestialPresetName,
  },
  decorators: [composeDecorators(withQueryClient, withThemedStoryStage)],
};

export default meta;
type Story = StoryObj<typeof NotFoundView>;

export const Default: Story = {};
