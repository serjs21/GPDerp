"use client";

import { ManageLabel } from "./ManageLabel";
import { ManageLabelsLoaderRow } from "./ManageLabelsLoaderRow";
import type { ManageLabelsRowsProps } from "./ManageLabelsRows.types";

/** Manage-label rows (with enter / exit motion) plus the next-page loader. */
export function ManageLabelsRows({
  fetchingNextPage,
  labels,
  enterDelays,
  exitingById,
  onChanged,
  onExitStart,
  onExitComplete,
  onEnterAnimationEnd,
  loaders,
}: ManageLabelsRowsProps) {
  return (
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
  );
}
