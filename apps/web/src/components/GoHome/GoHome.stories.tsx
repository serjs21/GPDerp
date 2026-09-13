"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GoHome } from "./GoHome";

const meta = {
  title: "Haiku/GoHome",
  component: GoHome,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/settings",
      },
    },
  },
  args: {
    forceShow: true,
  },
} satisfies Meta<typeof GoHome>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
