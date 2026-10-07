"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { withLoggedInAppLayout } from "@/storybook/decorators/withLoggedInAppLayout";
import { HeaderSearchButton } from "./HeaderSearchButton";

const meta = {
  title: "Haiku/HeaderSearchButton",
  component: HeaderSearchButton,
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
} satisfies Meta<typeof HeaderSearchButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {};

export const Hover: Story = {
  args: {
    forcedHover: true,
  },
};

export const SettingsShareLinks: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/settings",
        query: {
          tab: "share-links",
        },
      },
    },
  },
};

export const SettingsLabels: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/settings",
        query: {
          tab: "labels",
        },
      },
    },
  },
};
