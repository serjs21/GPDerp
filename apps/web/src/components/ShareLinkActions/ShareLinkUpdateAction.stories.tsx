"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ShareLinkUpdateAction } from "./ShareLinkUpdateAction";

const FRAME_STYLE = {
  display: "flex",
  flexDirection: "column",
  width: "6.25rem",
  height: "8rem",
} as const;

const meta = {
  title: "Haiku/ShareLinkUpdateAction",
  component: ShareLinkUpdateAction,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={FRAME_STYLE}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    onUpdate: { action: "onUpdate" },
  },
  args: {
    subject: "Morning mist",
    active: true,
    canUpdate: true,
    updating: false,
    onUpdate: () => {},
  },
} satisfies Meta<typeof ShareLinkUpdateAction>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Active link with pending limit changes. */
export const Enabled: Story = {};

/** Inactive link — disabled; hover/click shows the bubble. */
export const Inactive: Story = {
  args: { active: false, canUpdate: false },
};

/** Active link with nothing to change — disabled. */
export const Unchanged: Story = {
  args: { active: true, canUpdate: false },
};

/** Update request in flight. */
export const Updating: Story = {
  args: { updating: true },
};
