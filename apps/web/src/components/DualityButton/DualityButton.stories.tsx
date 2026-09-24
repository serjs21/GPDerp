"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { DualityButton } from "./DualityButton";

const meta = {
  title: "Haiku/DualityButton",
  component: DualityButton,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof DualityButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TimeSort: Story = {
  args: {
    topIconSrc: "/sort_button/time_new.svg",
    bottomIconSrc: "/sort_button/time_old.svg",
    "aria-label": "Toggle newest / oldest",
  },
};

function ControlledDemo() {
  const [flipped, setFlipped] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
      <DualityButton
        topIconSrc="/sort_button/time_new.svg"
        bottomIconSrc="/sort_button/time_old.svg"
        flipped={flipped}
        onFlippedChange={setFlipped}
        aria-label="Toggle newest / oldest"
      />
      <p style={{ margin: 0, fontFamily: "system-ui", fontSize: "0.85rem" }}>
        {flipped ? "Oldest first" : "Newest first"}
      </p>
    </div>
  );
}

export const Controlled: Story = {
  args: {
    topIconSrc: "/sort_button/time_new.svg",
    bottomIconSrc: "/sort_button/time_old.svg",
    "aria-label": "Toggle newest / oldest",
  },
  render: () => <ControlledDemo />,
};
