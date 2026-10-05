"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { fn } from "storybook/test";
import { ShareLinkActions, ShareLinkUpdateAction } from "@/components/ShareLinkActions";
import { ComicPressButton } from "./ComicPressButton";

const LABEL_STYLE = {
  padding: "0.6rem 1.2rem",
  border: "1px solid #111",
  background: "#f7f4ef",
  fontFamily: "var(--font-comic-label), Bangers, sans-serif",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
} as const;

const ROW_STYLE = {
  display: "flex",
  gap: "1.5rem",
  alignItems: "flex-start",
} as const;

const ACTIONS_FRAME_STYLE = {
  display: "flex",
  width: "6.25rem",
  height: "22rem",
} as const;

const UPDATE_FRAME_STYLE = {
  display: "flex",
  flexDirection: "column",
  width: "6.25rem",
  height: "8rem",
} as const;

const CAPTION_STYLE = {
  margin: "0 0 0.4rem",
  fontSize: "0.75rem",
  fontFamily: "sans-serif",
} as const;

const meta = {
  title: "Haiku/ComicPressButton",
  component: ComicPressButton,
  parameters: {
    layout: "centered",
  },
  args: {
    onClick: fn(),
    children: <span style={LABEL_STYLE}>Press me</span>,
  },
} satisfies Meta<typeof ComicPressButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hold the mouse down: shifts into its shadow; release to spring back. */
export const Default: Story = {};

/** Disabled: no shadow, no press. */
export const Disabled: Story = {
  args: { disabled: true },
};

function ShareLinkActionsDemo() {
  const [showLabels, setShowLabels] = useState(true);
  return (
    <div style={ROW_STYLE}>
      <div>
        <p style={CAPTION_STYLE}>Actions</p>
        <div style={ACTIONS_FRAME_STYLE}>
          <ShareLinkActions
            subject="Morning mist"
            shareUrl="https://example.com/share/demo-hash-active"
            showLabels={showLabels}
            togglingLabels={false}
            onPreview={fn()}
            onToggleLabels={() => setShowLabels((prev) => !prev)}
            onDelete={fn()}
          />
        </div>
      </div>
      <div>
        <p style={CAPTION_STYLE}>Update</p>
        <div style={UPDATE_FRAME_STYLE}>
          <ShareLinkUpdateAction
            subject="Morning mist"
            active
            canUpdate
            updating={false}
            onUpdate={fn()}
          />
        </div>
      </div>
      <div>
        <p style={CAPTION_STYLE}>Update (unchanged, disabled)</p>
        <div style={UPDATE_FRAME_STYLE}>
          <ShareLinkUpdateAction
            subject="Morning mist"
            active
            canUpdate={false}
            updating={false}
            onUpdate={fn()}
          />
        </div>
      </div>
    </div>
  );
}

/** Share link actions rendered through ComicPressButton; toggle labels to see the unpressed look. */
export const ShareLinkActionsStory: Story = {
  name: "Share link actions",
  render: () => <ShareLinkActionsDemo />,
};
