"use client";

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SHARE_LINK_WAKE_FRAMES } from "./consts/shareLinkUpdateActionConsts";
import { ShareLinkWakeTransition } from "./ShareLinkWakeTransition";
import type { ShareLinkWakeTransitionProps } from "./ShareLinkWakeTransition.types";

/** Matches the Update column in ShareLinkManagementRow (6.25rem × settings panel min-height). */
const FRAME_STYLE = {
  display: "flex",
  flexDirection: "column",
  width: "6.25rem",
  height: "8rem",
} as const;

const STACK_STYLE = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "0.75rem",
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

function ReplayableWake(args: ShareLinkWakeTransitionProps) {
  const [run, setRun] = useState(0);
  return (
    <div style={STACK_STYLE}>
      <div style={FRAME_STYLE}>
        <ShareLinkWakeTransition key={run} {...args} playing={args.playing && run > 0} />
      </div>
      <button type="button" onClick={() => setRun((n) => n + 1)}>
        {run === 0 ? "Start link" : "Replay"}
      </button>
    </div>
  );
}

const meta = {
  title: "Haiku/ShareLinkWakeTransition",
  component: ShareLinkWakeTransition,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    holdMs: { control: { type: "range", min: 0, max: 1000, step: 10 } },
    crossfadeMs: { control: { type: "range", min: 0, max: 600, step: 10 } },
    fadeMode: { control: "inline-radio", options: ["crossfade", "outThenCut"] },
    onComplete: { action: "onComplete" },
  },
  args: {
    subject: "Morning mist",
    playing: true,
    reducedMotion: false,
  },
  render: (args) => <ReplayableWake {...args} />,
} satisfies Meta<typeof ShareLinkWakeTransition>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Press "Start link" to play not_started → wake_1 → wake_2 → update_disabled. */
export const Wake: Story = {};

/** Hard cuts between frames (no crossfade). */
export const HardCut: Story = {
  args: { crossfadeMs: 0 },
};

/** Each wake frame, static, at Update-panel size. */
export const Frames: Story = {
  render: () => (
    <div style={GRID_STYLE}>
      {SHARE_LINK_WAKE_FRAMES.map((src) => (
        <div key={src}>
          <p style={CAPTION_STYLE}>{src.split("/").pop()}</p>
          <div style={FRAME_STYLE}>
            {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
            <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>
      ))}
    </div>
  ),
};
