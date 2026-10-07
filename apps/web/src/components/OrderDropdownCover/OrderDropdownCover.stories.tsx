"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OrderDropdownCover } from "./OrderDropdownCover";

const meta = {
  title: "Haiku/OrderDropdownCover",
  component: OrderDropdownCover,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof OrderDropdownCover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
  args: { widthRem: 2.5 },
};

export const Large: Story = {
  args: { widthRem: 10 },
};

export const Disabled: Story = {
  args: { disabled: true },
};
