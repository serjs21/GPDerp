"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { ShareLinkActions } from "./ShareLinkActions";
import type { ShareLinkActionsProps } from "./ShareLinkActions.types";

const FRAME_STYLE = {
  display: "flex",
  width: "6.25rem",
  height: "14rem",
} as const;

const meta = {
  title: "Haiku/ShareLinkActions",
  component: ShareLinkActions,
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
    onPreview: { action: "onPreview" },
    onToggleLabels: { action: "onToggleLabels" },
    onDelete: { action: "onDelete" },
  },
  args: {
    subject: "Morning mist",
    shareUrl: "https://example.com/share/demo-hash-active",
    showLabels: true,
    togglingLabels: false,
    onPreview: () => {},
    onToggleLabels: () => {},
    onDelete: () => {},
  },
} satisfies Meta<typeof ShareLinkActions>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Labels shown on the public page. */
export const Default: Story = {};

/** Labels hidden on the public page — black panel + hide icon. */
export const LabelsHidden: Story = {
  name: "Labels hidden",
  args: { showLabels: false },
};

function InteractiveActions(props: ShareLinkActionsProps) {
  const [showLabels, setShowLabels] = useState(props.showLabels);
  return (
    <ShareLinkActions
      {...props}
      showLabels={showLabels}
      onToggleLabels={() => {
        setShowLabels((prev) => !prev);
        props.onToggleLabels();
      }}
    />
  );
}

/** Local state: toggle labels on/off. */
export const Interactive: Story = {
  render: (args) => <InteractiveActions {...args} />,
};
