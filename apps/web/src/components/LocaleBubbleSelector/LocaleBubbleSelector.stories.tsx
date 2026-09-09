"use client";

import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { AppLocale } from "@/config/userConfiguration";
import { LocaleBubbleSelector } from "./LocaleBubbleSelector";

const LOCALE_OPTIONS = [
  { value: "en" as const, label: "English" },
  { value: "ja" as const, label: "日本語" },
  { value: "es" as const, label: "Español" },
  { value: "fr" as const, label: "Français" },
  { value: "de" as const, label: "Deutsch" },
  { value: "it" as const, label: "Italiano" },
  { value: "pt" as const, label: "Português" },
  { value: "th" as const, label: "ไทย" },
  { value: "lol" as const, label: "LOL" },
];

const meta = {
  title: "Haiku/LocaleBubbleSelector",
  component: LocaleBubbleSelector,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    options: LOCALE_OPTIONS,
    placeholder: "Language",
    dropDirection: "down",
    tailDirection: "top-left",
  },
} satisfies Meta<typeof LocaleBubbleSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function DefaultRender(args) {
    const [value, setValue] = useState<AppLocale>("en");
    return (
      <div style={{ minHeight: "18rem", padding: "3rem" }}>
        <LocaleBubbleSelector
          {...args}
          value={value}
          onChange={setValue}
          defaultOpen
        />
      </div>
    );
  },
};

export const Closed: Story = {
  render: function ClosedRender(args) {
    const [value, setValue] = useState<AppLocale>("ja");
    return (
      <LocaleBubbleSelector {...args} value={value} onChange={setValue} />
    );
  },
};

export const DropDownLeft: Story = {
  name: "Drop down-left (header-style)",
  args: {
    dropDirection: "down-left",
    tailDirection: "top-right",
  },
  render: function DropDownLeftRender(args) {
    const [value, setValue] = useState<AppLocale>("fr");
    return (
      <div style={{ minHeight: "18rem", padding: "3rem", display: "flex", justifyContent: "flex-end" }}>
        <LocaleBubbleSelector
          {...args}
          value={value}
          onChange={setValue}
          defaultOpen
        />
      </div>
    );
  },
};
