"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { ALL_SHARE_LINK_FILTERS, type ShareLinkFilter } from "@/api/shareLinks";
import {
  SHARE_LINKS_SORT_DEFAULT_VALUE,
  ShareLinksSort,
  type ShareLinksSortValue,
} from "@/components/ShareLinksSort";
import { ShareLinkFilterPanels } from "./ShareLinkFilterPanels";
import styles from "./ShareLinkVerticalSortFilters.stories.module.css";

const meta = {
  title: "Haiku/ShareLinkManagement/Vertical sort + filters",
  component: ShareLinkFilterPanels,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ShareLinkFilterPanels>;

export default meta;
type Story = StoryObj<typeof meta>;

function VerticalSortFilters() {
  const [sort, setSort] = useState<ShareLinksSortValue>(
    SHARE_LINKS_SORT_DEFAULT_VALUE,
  );
  const [filters, setFilters] = useState<ShareLinkFilter[]>([
    ...ALL_SHARE_LINK_FILTERS,
  ]);

  return (
    <div className={styles.stage}>
      <ShareLinksSort
        value={sort}
        onChange={setSort}
        rotated
        className={styles.sort}
      />
      <div className={styles.filters}>
        <ShareLinkFilterPanels
          selected={filters}
          onChange={setFilters}
          columns={2}
        />
      </div>
      <p className={styles.readout}>
        sort: {sort.categoryId ?? "none"} · {sort.direction} — filters:{" "}
        {filters.join(", ") || "none"}
      </p>
    </div>
  );
}

/** Rotated (vertical) share-link sort above the status filters (2 per row). */
export const VerticalSortWithFilters: Story = {
  name: "Vertical sort + filters",
  args: {
    selected: [...ALL_SHARE_LINK_FILTERS],
    onChange: () => {},
  },
  render: () => <VerticalSortFilters />,
};
