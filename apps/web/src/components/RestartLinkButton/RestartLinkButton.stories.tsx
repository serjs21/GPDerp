import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { RestartLinkButton } from "./RestartLinkButton";

const meta = {
  title: "Haiku/RestartLinkButton",
  component: RestartLinkButton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    onClick: fn(),
    reviveTextX: 50,
    reviveTextY: 80,
    reviveTextRotate: -3,
  },
  argTypes: {
    reviveTextX: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Revive! banner left, percent of the expired emblem",
    },
    reviveTextY: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Revive! banner top, percent of the expired emblem",
    },
    reviveTextRotate: {
      control: { type: "range", min: -30, max: 30, step: 1 },
      description: "Revive! banner rotation in degrees",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "18rem", padding: "5rem 1rem" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RestartLinkButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HitsLimit: Story = {
  args: {
    reason: "limit_reached",
  },
};

export const Expired: Story = {
  args: {
    reason: "expired",
  },
};

export const ExpiredHover: Story = {
  args: {
    reason: "expired",
    forceHover: true,
    reviveTextX: 50,
    reviveTextY: 50,
    reviveTextRotate: -3,
  },
};
