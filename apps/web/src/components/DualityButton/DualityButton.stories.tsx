"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { CoverState } from "./CoverState";
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

export const AlphabeticSort: Story = {
  args: {
    topIconSrc: "/sort_button/alpabeth_start.svg",
    bottomIconSrc: "/sort_button/alpabeth_end.svg",
    iconTone: "strokeInvert",
    "aria-label": "Toggle A–Z / Z–A",
  },
};

export const HitpointsSort: Story = {
  args: {
    topIconSrc: "/sort_button/hitpoints_high.svg",
    bottomIconSrc: "/sort_button/hitpoints_low.svg",
    "aria-label": "Toggle highest / lowest hitpoints",
  },
};

export const TimeLeft: Story = {
  args: {
    centerIconSrc: "/sort_button/time_left.svg",
    centerIconScale: 2,
    iconTone: "strokeInvert",
    "aria-label": "Toggle time remaining sort",
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

/** Covered time sort — CoverIcon over the base; CoverLabel morphs into the arrow. */
export const TimeCover: Story = {
  name: "Time cover",
  args: {
    topIconSrc: "/sort_button/time_new.svg",
    bottomIconSrc: "/sort_button/time_old.svg",
    "aria-label": "Toggle newest / oldest",
  },
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2.5rem",
        paddingTop: "1.5rem",
      }}
    >
      <CoverState
        iconSrc="/sort_button/time_cover.svg"
        title="Creation date"
        sizeRem={3.5}
        coverAriaLabel="Reveal time sort"
        topIconSrc="/sort_button/time_new.svg"
        bottomIconSrc="/sort_button/time_old.svg"
        aria-label="Toggle newest / oldest"
      />
      <p style={{ margin: 0, fontFamily: "system-ui", fontSize: "0.8rem", opacity: 0.75 }}>
        Click — coin flips; cover / duality base are opposite faces
      </p>
    </div>
  ),
};
