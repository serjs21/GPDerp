"use client";

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SHARE_LINK_WAKE_FRAMES } from "./consts/shareLinkUpdateActionConsts";
import { ShareLinkUpdateAction } from "./ShareLinkUpdateAction";
import { ShareLinkWakeTransition } from "./ShareLinkWakeTransition";
import type { ShareLinkWakeSegment } from "./ShareLinkWakeTransition.types";
import { isShareLinkWakeSettled } from "./utils/shareLinkWakeUtils";

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

const BUTTONS_STYLE = { display: "flex", gap: "0.5rem" } as const;

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

const PENDING: Partial<Record<ShareLinkWakeSegment, true>> = { waking: true, sleeping: true };

/** Simulated delay between the start request confirming and the link prop turning active. */
const ACTIVE_LAG_MS = 1000;

/**
 * Mirrors useShareLinkControls: hold mid-frame until the request is confirmed or
 * fails; a confirmed start also holds wake_1 until the link turns active.
 */
function SimulatedLifecycle() {
  const [active, setActive] = useState(false);
  const [wake, setWake] = useState<{
    segment: ShareLinkWakeSegment;
    ended: boolean;
    awaitingActive?: boolean;
  } | null>(null);
  if (wake?.awaitingActive && active) setWake({ segment: "wakeConfirmed", ended: false });
  if (wake?.ended && isShareLinkWakeSettled(wake.segment, active)) setWake(null);
  const pending = wake != null && PENDING[wake.segment] === true && !wake.awaitingActive;

  const settle = (ok: boolean) => {
    if (!wake) return;
    if (wake.segment === "waking") {
      if (!ok) {
        setWake({ segment: "wakeFailed", ended: false });
        return;
      }
      setWake({ ...wake, awaitingActive: true });
      window.setTimeout(() => setActive(true), ACTIVE_LAG_MS);
      return;
    }
    if (ok) setActive(false);
    setWake({ segment: ok ? "sleepConfirmed" : "sleepFailed", ended: false });
  };

  return (
    <div style={STACK_STYLE}>
      <div style={FRAME_STYLE}>
        <ShareLinkUpdateAction
          subject="Morning mist"
          active={active}
          canUpdate={false}
          updating={false}
          onUpdate={() => {}}
          wakeSegment={wake?.segment ?? null}
          onWakeAnimationEnd={() => setWake((w) => (w ? { ...w, ended: true } : w))}
        />
      </div>
      <div style={BUTTONS_STYLE}>
        {pending ? (
          <>
            <button type="button" onClick={() => settle(true)}>
              Confirm
            </button>
            <button type="button" onClick={() => settle(false)}>
              Fail
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={wake != null}
            onClick={() => setWake({ segment: active ? "sleeping" : "waking", ended: false })}
          >
            {active ? "Stop link" : "Start link"}
          </button>
        )}
      </div>
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
    segment: {
      control: "select",
      options: ["waking", "wakeConfirmed", "wakeFailed", "sleeping", "sleepConfirmed", "sleepFailed"],
    },
    holdMs: { control: { type: "range", min: 0, max: 1000, step: 10 } },
    crossfadeMs: { control: { type: "range", min: 0, max: 600, step: 10 } },
    fadeMode: { control: "inline-radio", options: ["crossfade", "outThenCut"] },
    onComplete: { action: "onComplete" },
  },
  args: {
    subject: "Morning mist",
    segment: "wakeConfirmed",
    reducedMotion: false,
  },
  render: (args) => (
    <div style={FRAME_STYLE}>
      <ShareLinkWakeTransition {...args} />
    </div>
  ),
} satisfies Meta<typeof ShareLinkWakeTransition>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Start / stop with a simulated request: Confirm continues, Fail plays back. */
export const Lifecycle: Story = {
  render: () => <SimulatedLifecycle />,
};

/** One segment in isolation — pick it from the controls. */
export const Segment: Story = {};

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
