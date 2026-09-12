"use client";

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BrushMenu, type BrushMenuOption } from "./BrushMenu";

const BASIC_OPTIONS: BrushMenuOption[] = [
  { value: "sumi", label: "Sumi ink" },
  { value: "vermillion", label: "Vermillion" },
  { value: "indigo", label: "Indigo night" },
  { value: "gold", label: "Gold dust" },
];

const meta = {
  title: "Haiku/BrushMenu",
  component: BrushMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    options: BASIC_OPTIONS,
    placeholder: "Pick a brush",
  },
} satisfies Meta<typeof BrushMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function DefaultRender(args) {
    const [value, setValue] = useState<string | null>(null);
    return <BrushMenu {...args} value={value} onChange={setValue} />;
  },
};

export const Open: Story = {
  name: "Open (drawable)",
  render: function OpenRender(args) {
    const [value, setValue] = useState<string | null>("indigo");
    const [open, setOpen] = useState(true);
    return (
      <BrushMenu
        {...args}
        value={value}
        open={open}
        onOpenChange={setOpen}
        onChange={setValue}
      />
    );
  },
};

export const ReducedMotion: Story = {
  name: "Reduced motion",
  parameters: {
    chromatic: { disableSnapshot: true },
    // Document expected end-state; useReducedMotion follows OS preference in Storybook.
  },
  render: function ReducedMotionRender(args) {
    const [value, setValue] = useState<string | null>("sumi");
    return (
      <BrushMenu {...args} value={value} defaultOpen onChange={setValue} />
    );
  },
};
