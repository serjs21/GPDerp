"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { withLoggedInAppLayout } from "@/storybook/decorators/withLoggedInAppLayout";
import { HeaderFilterButton } from "./HeaderFilterButton";

const meta = {
  title: "Haiku/HeaderFilterButton",
  component: HeaderFilterButton,
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
} satisfies Meta<typeof HeaderFilterButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {};

export const Hover: Story = {
  args: {
    forcedHover: true,
  },
};
