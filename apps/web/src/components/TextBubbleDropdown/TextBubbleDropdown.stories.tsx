"use client";

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  TextBubbleDropdown,
  type TextBubbleDropDirection,
  type TextBubbleOption,
  type TextBubbleTailDirection,
} from "./TextBubbleDropdown";

const BASIC_OPTIONS: TextBubbleOption[] = [
  { value: "select", label: "Select option" },
  { value: "1", label: "Option 1" },
  { value: "2", label: "Option 2" },
  { value: "3", label: "Option 3" },
  { value: "4", label: "Option 4" },
];

const LONG_OPTIONS: TextBubbleOption[] = Array.from({ length: 16 }, (_, index) => ({
  value: `opt-${index + 1}`,
  label: `Option ${index + 1}`,
}));

const DROP_MATRIX: Array<{
  dropDirection: TextBubbleDropDirection;
  tailDirection: TextBubbleTailDirection;
  label: string;
}> = [
  { dropDirection: "down", tailDirection: "top-left", label: "down" },
  { dropDirection: "up", tailDirection: "bottom-left", label: "up" },
  { dropDirection: "left", tailDirection: "right", label: "left" },
  { dropDirection: "right", tailDirection: "left", label: "right" },
  { dropDirection: "down-left", tailDirection: "top-right", label: "down-left" },
  { dropDirection: "down-right", tailDirection: "top-left", label: "down-right" },
  { dropDirection: "up-left", tailDirection: "bottom-right", label: "up-left" },
  { dropDirection: "up-right", tailDirection: "bottom-left", label: "up-right" },
];

const meta = {
  title: "Haiku/TextBubbleDropdown",
  component: TextBubbleDropdown,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    options: BASIC_OPTIONS,
    placeholder: "Select option",
    dropDirection: "down",
    tailDirection: "top-left",
  },
} satisfies Meta<typeof TextBubbleDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function DefaultRender(args) {
    const [value, setValue] = useState<string | null>("select");
    return (
      <div style={{ minHeight: "18rem", padding: "3rem" }}>
        <TextBubbleDropdown
          {...args}
          value={value}
          onChange={setValue}
          defaultOpen
        />
      </div>
    );
  },
};

export const Scrollable: Story = {
  name: "Scrollable list",
  args: {
    options: LONG_OPTIONS,
    placeholder: "Pick one",
  },
  render: function ScrollableRender(args) {
    const [value, setValue] = useState<string | null>("opt-3");
    const [open, setOpen] = useState(true);
    return (
      <div style={{ minHeight: "20rem", padding: "3rem" }}>
        <TextBubbleDropdown
          {...args}
          value={value}
          open={open}
          onOpenChange={setOpen}
          onChange={setValue}
        />
      </div>
    );
  },
};

export const Closed: Story = {
  render: function ClosedRender(args) {
    const [value, setValue] = useState<string | null>(null);
    return (
      <TextBubbleDropdown
        {...args}
        value={value}
        onChange={setValue}
        placeholder="Choose…"
      />
    );
  },
};

export const DropDirections: Story = {
  name: "All drop directions",
  render: function DropDirectionsRender() {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(14rem, 1fr))",
          gap: "7rem 4rem",
          padding: "6rem 4rem",
        }}
      >
        {DROP_MATRIX.map((entry) => (
          <div key={entry.label} style={{ position: "relative", minHeight: "8rem" }}>
            <p style={{ margin: "0 0 0.5rem", fontSize: "0.85rem" }}>{entry.label}</p>
            <TextBubbleDropdown
              options={BASIC_OPTIONS}
              value="select"
              defaultOpen
              dropDirection={entry.dropDirection}
              tailDirection={entry.tailDirection}
            />
          </div>
        ))}
      </div>
    );
  },
};
