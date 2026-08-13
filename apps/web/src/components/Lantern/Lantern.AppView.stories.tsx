"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HomePageContent } from "@/app/HomePageContent";
import type { CelestialPresetName } from "@/theme/celestialPresets";
import { withLoggedInAppLayout } from "@/storybook/decorators/withLoggedInAppLayout";

const meta: Meta<typeof HomePageContent> = {
  title: "Haiku/Lantern",
  component: HomePageContent,
  parameters: {
    layout: "fullscreen",
    initialCelestialPreset: "blueNight" satisfies CelestialPresetName,
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/",
      },
    },
  },
  decorators: [withLoggedInAppLayout],
};

export default meta;
type Story = StoryObj<typeof HomePageContent>;

export const AppView: Story = {};
