"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ShareLinkUpdateAction } from "./ShareLinkUpdateAction";
import type { ShareLinkUpdateActionProps } from "./ShareLinkUpdateAction.types";

/** Matches the Update column in ShareLinkManagementRow (6.25rem × settings panel min-height). */
const FRAME_STYLE = {
  display: "flex",
  flexDirection: "column",
  width: "6.25rem",
  height: "8rem",
} as const;

const GRID_STYLE = {
  display: "flex",
  gap: "1.5rem",
  alignItems: "flex-start",
} as const;

const CAPTION_STYLE = {
  margin: "0 0 0.4rem",
  fontSize: "0.75rem",
  fontFamily: "sans-serif",
} as const;

const STATES: { name: string; args: Omit<ShareLinkUpdateActionProps, "subject" | "onUpdate"> }[] = [
  { name: "Enabled", args: { active: true, canUpdate: true, updating: false } },
  { name: "Updating", args: { active: true, canUpdate: true, updating: true } },
  { name: "Unchanged", args: { active: true, canUpdate: false, updating: false } },
  { name: "Inactive", args: { active: false, canUpdate: false, updating: false } },
];

const meta = {
  title: "Haiku/ShareLinkUpdateAction",
  component: ShareLinkUpdateAction,
  parameters: {
    layout: "centered",
  },
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
  render: (args) => (
    <div style={FRAME_STYLE}>
      <ShareLinkUpdateAction {...args} />
    </div>
  ),
} satisfies Meta<typeof ShareLinkUpdateAction>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Active link with valid pending limit changes — clickable, hover fill. */
export const Enabled: Story = {};

/** Update request in flight — panel loading state. */
export const Updating: Story = {
  args: { updating: true },
};

/** Active link with nothing to change — disabled; hover/click shows "Everything's in its right place". */
export const Unchanged: Story = {
  args: { active: true, canUpdate: false },
};

/** Inactive link — disabled; hover/click shows "What is yet to begin - can't be changed". */
export const Inactive: Story = {
  args: { active: false, canUpdate: false },
};

/** Every state side by side. */
export const AllStates: Story = {
  name: "All states",
  render: (args) => (
    <div style={GRID_STYLE}>
      {STATES.map((state) => (
        <div key={state.name}>
          <p style={CAPTION_STYLE}>{state.name}</p>
          <div style={FRAME_STYLE}>
            <ShareLinkUpdateAction {...args} {...state.args} />
          </div>
        </div>
      ))}
    </div>
  ),
};
