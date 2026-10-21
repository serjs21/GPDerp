"use client";

import { useTranslations } from "next-intl";
import { ManageLabel } from "./ManageLabel";
import { ManageLabelsLoaderRow } from "./ManageLabelsLoaderRow";
import type { ManageLabelsListProps } from "./ManageLabelsList.types";
import styles from "./ManageLabelsPanel.module.css";

/** Scrollable manage-label rows: first-page loader, empty copy, or rows plus a next-page loader. */
export function ManageLabelsList({
  loading,
  fetchingNextPage,
  labels,
  hasQuery,
  enterDelays,
  exitingById,
  onChanged,
  onExitStart,
  onExitComplete,
  onEnterAnimationEnd,
  onScroll,
  loader,
}: ManageLabelsListProps) {
  const t = useTranslations("ManageLabel.panel");

  if (loading) {
    return (
      <div className={styles.listScroll} onScroll={onScroll}>
        <ManageLabelsLoaderRow loader={loader} />
      </div>
    );
  }

  return (
    <div className={styles.listScroll} onScroll={onScroll}>
      {labels.length === 0 ? (
        <div className={styles.emptyLayout}>
          <p className={styles.empty}>{hasQuery ? t("noResults") : t("empty")}</p>
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
          {fetchingNextPage ? <ManageLabelsLoaderRow loader={loader} /> : null}
        </>
      )}
    </div>
  );
}
