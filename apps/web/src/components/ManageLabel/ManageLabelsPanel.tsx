"use client";

import { useState } from "react";
import { LABEL_SORT_DEFAULT_VALUE, type LabelSortValue } from "@/components/LabelSort";
import { withDefaults } from "@/utils/props/withDefaults";
import { ManageLabelCreatePanel } from "./ManageLabelCreatePanel";
import { ManageLabelsList } from "./ManageLabelsList";
import type { ManageLabelsListProps } from "./ManageLabelsList.types";
import { ManageLabelsSearch } from "./ManageLabelsSearch";
import { ManageLabelsSortLayout } from "./ManageLabelsSortLayout";
import { useLabelRowLifecycle } from "./useLabelRowLifecycle";
import { useManageLabelsSearch } from "./useManageLabelsSearch";
import { useSortedLabelPages } from "./useSortedLabelPages";
import { labelSortPlacement } from "./utils/mergeDisplayLabels";
import styles from "./ManageLabelsPanel.module.css";

export type ManageLabelsPanelProps = {
  accountId: string;
  /** When false, skips fetch until activated (inactive modal tab). */
  active?: boolean;
  className?: string;
  /** Comic / plain local search, or none when header drives `searchQuery`. */
  searchVariant?: "comic" | "plain" | "none";
  /** Controlled query when `searchVariant` is `"none"` (settings header). */
  searchQuery?: string;
  showCreate?: boolean;
  /** Show the LabelSort panel above the list. */
  showSort?: boolean;
  /** When set, sort (rotated) + create render here instead of above the list. */
  sidePanelTarget?: HTMLElement | null;
  /** List loader (first page and next page); defaults to the sakura petal loader. */
  loader?: ManageLabelsListProps["loader"];
};

const MANAGE_LABELS_PANEL_DEFAULTS = {
  active: true,
  searchVariant: "comic",
  searchQuery: "",
  showCreate: true,
  showSort: false,
} as const;

const CREATE_CLASS_BY_PLACEMENT = {
  side: styles.createInSide,
  frame: styles.createBesideSort,
  none: undefined,
};

export function ManageLabelsPanel(props: ManageLabelsPanelProps) {
  const { accountId, active, searchVariant, searchQuery, showCreate, showSort } = withDefaults(
    props,
    MANAGE_LABELS_PANEL_DEFAULTS,
  );
  const [sort, setSort] = useState<LabelSortValue>(LABEL_SORT_DEFAULT_VALUE);
  const search = useManageLabelsSearch(active, searchVariant === "none", searchQuery);
  const pages = useSortedLabelPages({ accountId, active, query: search.resolvedQ, sort });
  const rows = useLabelRowLifecycle({
    active,
    isPagedLoading: pages.isPagedLoading,
    pagedLabels: pages.pagedLabels,
    orderedLabels: pages.orderedLabels,
  });
  const placement = labelSortPlacement(showSort, props.sidePanelTarget);

  const createPanel = showCreate ? (
    <ManageLabelCreatePanel
      accountId={accountId}
      onCreated={(label) => {
        rows.trackCreated(label.id);
        pages.refresh();
      }}
      stretch={showSort}
      className={CREATE_CLASS_BY_PLACEMENT[placement]}
    />
  ) : null;

  return (
    <div className={[styles.root, props.className].filter(Boolean).join(" ")}>
      <ManageLabelsSearch
        variant={searchVariant}
        inputRef={search.searchRef}
        value={search.searchInput}
        onChange={search.setSearchInput}
      />
      <ManageLabelsSortLayout
        placement={placement}
        sidePanelTarget={props.sidePanelTarget}
        sort={sort}
        onSortChange={setSort}
      >
        {createPanel}
      </ManageLabelsSortLayout>
      <ManageLabelsList
        loading={pages.isPagedLoading}
        fetchingNextPage={pages.isFetchingNextPage}
        labels={rows.displayLabels}
        hasQuery={Boolean(search.resolvedQ)}
        enterDelays={rows.enterDelays}
        exitingById={rows.exitingById}
        onChanged={pages.refresh}
        onExitStart={rows.handleExitStart}
        onExitComplete={rows.handleExitComplete}
        onEnterAnimationEnd={rows.clearEnterAnimation}
        onScroll={pages.loadMoreNearEnd}
        loader={props.loader}
      />
      {placement === "none" ? createPanel : null}
    </div>
  );
}
