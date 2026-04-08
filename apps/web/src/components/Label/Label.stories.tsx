import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Label } from "./Label";

const meta: Meta<typeof Label> = {
  title: "Haiku/Label",
  component: Label,
  args: {
    name: "Nature",
    color: "green",
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Green: Story = {};

export const Blue: Story = {
  args: {
    name: "Morning",
    color: "blue",
  },
};

export const HexColor: Story = {
  args: {
    name: "Custom",
    color: "#8a2be2",
  },
};

export const Default: Story = {
  args: {
    name: "Default",
    color: "default",
  },
};

export const Clickable: Story = {
  args: {
    name: "Clickable",
    color: "processing",
    onClick: () => undefined,
  },
};
