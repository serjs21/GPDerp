import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { WritingLoader } from "./WritingLoader";

const meta = {
  title: "Loaders/WritingLoader",
  component: WritingLoader,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof WritingLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Feather: Story = {
  args: { variant: "feather" },
};

export const Pen: Story = {
  args: { variant: "pen" },
};

export const Paintbrush: Story = {
  args: { variant: "paintbrush" },
};

export const Hand: Story = {
  args: { variant: "hand" },
};

export const FountainPen: Story = {
  args: { variant: "fountain_pen" },
};

export const Crayon: Story = {
  args: { variant: "crayon" },
};
