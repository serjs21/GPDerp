"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { withLoggedInAppLayout } from "@/storybook/decorators/withLoggedInAppLayout";
import { HeaderOrderDropdown } from "./HeaderOrderDropdown";

const meta = {
  title: "Haiku/HeaderOrderDropdown",
  component: HeaderOrderDropdown,
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
} satisfies Meta<typeof HeaderOrderDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
