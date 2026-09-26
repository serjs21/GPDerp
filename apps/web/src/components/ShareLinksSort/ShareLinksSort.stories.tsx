"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import {
  SHARE_LINKS_SORT_DEFAULT_VALUE,
  type ShareLinksSortValue,
} from "./consts/shareLinksSortConsts";
import { ShareLinksSort } from "./ShareLinksSort";

const meta = {
  title: "Haiku/ShareLinksSort",
  component: ShareLinksSort,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    onChange: { action: "onChange" },
    value: { control: false },
    categories: { control: false },
  },
} satisfies Meta<typeof ShareLinksSort>;

export default meta;
type Story = StoryObj<typeof meta>;

function StatefulSort({ initial }: { initial: ShareLinksSortValue }) {
  const [value, setValue] = useState<ShareLinksSortValue>(initial);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.25rem",
      }}
    >
      <ShareLinksSort value={value} onChange={setValue} />
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

/** Four CoverState coins — one uncovered; switching re-covers the previous. */
export const CombinedIcons: Story = {
  name: "Combined icons",
  args: {
    value: undefined,
    onChange: () => {},
  },
  render: () => <StatefulSort initial={SHARE_LINKS_SORT_DEFAULT_VALUE} />,
};
