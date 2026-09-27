"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import {
  LABEL_SORT_DEFAULT_VALUE,
  type LabelSortValue,
} from "./consts/labelSortConsts";
import { LabelSort } from "./LabelSort";

const meta = {
  title: "Haiku/LabelSort",
  component: LabelSort,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    onChange: { action: "onChange" },
    value: { control: false },
    categories: { control: false },
  },
} satisfies Meta<typeof LabelSort>;

export default meta;
type Story = StoryObj<typeof meta>;

function StatefulSort({
  initial,
  rotated = false,
}: {
  initial: LabelSortValue;
  rotated?: boolean;
}) {
  const [value, setValue] = useState<LabelSortValue>(initial);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.25rem",
      }}
    >
      <LabelSort value={value} onChange={setValue} rotated={rotated} />
      <p
        style={{
          margin: 0,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: "0.75rem",
          opacity: 0.72,
        }}
      >
        {value.categoryId ?? "none"} · {value.direction}
      </p>
      <p
        style={{
          margin: 0,
          maxWidth: "22rem",
          fontFamily: "system-ui, sans-serif",
          fontSize: "0.8rem",
          opacity: 0.7,
          textAlign: "center",
        }}
      >
        Selected coin is uncovered (none selected by default). Click a cover to
        open that category. Click another cover to switch. Click the open face
        to flip asc/desc.
      </p>
    </div>
  );
}

/** Three CoverState coins — one uncovered; switching re-covers the previous. */
export const CombinedIcons: Story = {
  name: "Combined icons",
  args: {
    value: LABEL_SORT_DEFAULT_VALUE,
    onChange: () => {},
  },
  render: () => <StatefulSort initial={LABEL_SORT_DEFAULT_VALUE} />,
};

/** Horizontal title; coins stacked in a column. */
export const Rotated: Story = {
  args: {
    value: LABEL_SORT_DEFAULT_VALUE,
    onChange: () => {},
  },
  render: () => <StatefulSort initial={LABEL_SORT_DEFAULT_VALUE} rotated />,
};
