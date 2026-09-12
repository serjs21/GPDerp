"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { withLoggedInAppLayout } from "@/storybook/decorators/withLoggedInAppLayout";
import { SearchPanel } from "./SearchPanel";

const meta = {
  title: "Haiku/SearchPanel",
  component: SearchPanel,
  tags: ["autodocs"],
  decorators: [withLoggedInAppLayout],
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/",
      },
    },
  },
} satisfies Meta<typeof SearchPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {};

export const HoverFilter: Story = {
  args: {
    forcedHover: "filter",
  },
};

export const HoverSearch: Story = {
  args: {
    forcedHover: "search",
  },
};
