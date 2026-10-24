"use client";

import { useRef } from "react";
import { FetchEmptyState } from "@/components/FetchEmptyState";
import { LIST_REVEAL_MAX_WAIT_MS } from "@/consts/visualReadiness/criticalAssets";
import { useRenderedContentReveal } from "@/hooks/useRenderedContentReveal";
import { ManageLabelsLoaderRow } from "./ManageLabelsLoaderRow";
import type { ManageLabelsListProps } from "./ManageLabelsList.types";
import { ManageLabelsRows } from "./ManageLabelsRows";
import styles from "./ManageLabelsPanel.module.css";

/**
 * Scrollable manage-label rows: first-page loader, empty state, or rows plus a next-page loader.
 * The first-page loader stays over the rendered rows until their art and fonts are ready.
 */
export function ManageLabelsList({ loading, onScroll, ...rows }: ManageLabelsListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const revealed = useRenderedContentReveal(listRef, {
    pending: loading,
    maxWaitMs: LIST_REVEAL_MAX_WAIT_MS,
  });
  const loader = <ManageLabelsLoaderRow loaders={rows.loaders} kind="initial" />;

  if (loading) {
    return (
      <div className={styles.listScroll} onScroll={onScroll} aria-busy>
        {loader}
      </div>
    );
  }

  return (
    <div ref={listRef} className={styles.listScroll} onScroll={onScroll} aria-busy={!revealed}>
      {revealed ? null : <div className={styles.revealOverlay}>{loader}</div>}
      <div className={styles.listContent} data-revealed={revealed}>
        {rows.labels.length === 0 ? (
          <div className={styles.emptyLayout}>
            <FetchEmptyState />
          </div>
        ) : (
          <ManageLabelsRows {...rows} />
        )}
      </div>
    </div>
  );
}
