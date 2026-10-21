"use client";

import { FetchEmptyState } from "@/components/FetchEmptyState";
import { ManageLabel } from "./ManageLabel";
import { ManageLabelsLoaderRow } from "./ManageLabelsLoaderRow";
import type { ManageLabelsListProps } from "./ManageLabelsList.types";
import styles from "./ManageLabelsPanel.module.css";

/** Scrollable manage-label rows: first-page loader, empty state, or rows plus a next-page loader. */
export function ManageLabelsList({
  loading,
  fetchingNextPage,
  labels,
  enterDelays,
  exitingById,
  onChanged,
  onExitStart,
  onExitComplete,
  onEnterAnimationEnd,
  onScroll,
  loaders,
}: ManageLabelsListProps) {
  if (loading) {
    return (
      <div className={styles.listScroll} onScroll={onScroll}>
        <ManageLabelsLoaderRow loaders={loaders} kind="initial" />
      </div>
    );
  }

  return (
    <div className={styles.listScroll} onScroll={onScroll}>
      {labels.length === 0 ? (
        <div className={styles.emptyLayout}>
          <FetchEmptyState />
        </div>
      ) : (
        <>
          {labels.map((label) => {
            const enterDelayMs = enterDelays[label.id];
            const isExiting = Boolean(exitingById[label.id]);
            return (
              <ManageLabel
                key={label.id}
                accountId={label.accountId}
                label={label}
                onChanged={onChanged}
                onExitStart={() => onExitStart(label)}
                onExitComplete={() => onExitComplete(label.id)}
                forceExiting={isExiting}
                animateEnter={enterDelayMs != null && !isExiting}
                enterDelayMs={enterDelayMs ?? 0}
                onEnterAnimationEnd={() => onEnterAnimationEnd(label.id)}
              />
            );
          })}
          {fetchingNextPage ? <ManageLabelsLoaderRow loaders={loaders} kind="nextPage" /> : null}
        </>
      )}
    </div>
  );
}
