"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import {
  LABEL_SORT_DEFAULT_VALUE,
  LabelSort,
  type LabelSortValue,
} from "@/components/LabelSort";
import { STORY_ACCOUNT_ID, withQueryClient } from "@/storybook";
import { ManageLabelCreatePanel } from "./ManageLabelCreatePanel";
import styles from "./LabelVerticalSortCreate.stories.module.css";

const meta = {
  title: "Haiku/ManageLabel/Vertical sort + create",
  component: ManageLabelCreatePanel,
  decorators: [withQueryClient],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ManageLabelCreatePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

function VerticalSortCreate() {
  const [sort, setSort] = useState<LabelSortValue>(LABEL_SORT_DEFAULT_VALUE);

  return (
    <div className={styles.stage}>
      <LabelSort
        value={sort}
        onChange={setSort}
        rotated
        color="red"
        background="halftone"
        className={styles.sort}
      />
      <ManageLabelCreatePanel
        accountId={STORY_ACCOUNT_ID}
        color="blue"
        vertical
        className={styles.create}
      />
      <p className={styles.readout}>
        sort: {sort.categoryId ?? "none"} · {sort.direction}
      </p>
    </div>
  );
}

/** Rotated (vertical) label sort above the "Create a new one" panel. */
export const VerticalSortWithCreate: Story = {
  name: "Vertical sort + create",
  args: {
    accountId: STORY_ACCOUNT_ID,
  },
  render: () => <VerticalSortCreate />,
};
