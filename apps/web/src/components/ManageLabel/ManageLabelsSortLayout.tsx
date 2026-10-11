"use client";

import { createPortal } from "react-dom";
import { LabelSort } from "@/components/LabelSort";
import type { ManageLabelsSortLayoutProps } from "./ManageLabelsSortLayout.types";
import styles from "./ManageLabelsPanel.module.css";

const SORT_PANEL_COLOR = "#ffca91";

/**
 * Sort + create placement: rotated in the side panel (portaled), or side by side above the list.
 * Renders nothing when sorting is hidden — the list then shows create below itself.
 */
export function ManageLabelsSortLayout({
  placement,
  sidePanelTarget,
  sort,
  onSortChange,
  children,
}: ManageLabelsSortLayoutProps) {
  if (placement === "side" && sidePanelTarget) {
    return createPortal(
      <div className={styles.sideStack}>
        <LabelSort
          value={sort}
          onChange={onSortChange}
          rotated
          color={SORT_PANEL_COLOR}
          background="solid"
          className={styles.sortInSide}
        />
        {children}
      </div>,
      sidePanelTarget,
    );
  }
  if (placement === "frame") {
    return (
      <div className={styles.sortRow}>
        <LabelSort
          value={sort}
          onChange={onSortChange}
          color={SORT_PANEL_COLOR}
          background="solid"
          className={styles.sortBesideCreate}
        />
        {children}
      </div>
    );
  }
  return null;
}
