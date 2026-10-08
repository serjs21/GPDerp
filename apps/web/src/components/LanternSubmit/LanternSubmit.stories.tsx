import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LanternSubmit } from "./LanternSubmit";

const meta: Meta<typeof LanternSubmit> = {
  title: "Haiku/LanternSubmit",
  component: LanternSubmit,
  args: {
    type: "button",
  },
};

export default meta;
type Story = StoryObj<typeof LanternSubmit>;

export const Active: Story = {
  args: {
    active: true,
    disabled: false,
  },
};

export const Disabled: Story = {
  args: {
    active: false,
    disabled: true,
  },
};
