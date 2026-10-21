"use client";

import { ComicPageRow } from "@/components/ComicPageLayout";
import { FetchEmptyState } from "@/components/FetchEmptyState";
import { FetchingStaticLoader } from "@/components/Loaders/FetchingLoader";
import { LabelPickerOption } from "./LabelPickerOption";
import type { LabelPickerResultsProps } from "./LabelPickerResults.types";
import { chunkRows } from "./utils/labelPickerUtils";
import styles from "./ComicLabelPickerPanel.module.css";

const LABELS_PER_ROW = 3;

/** Scrollable label grid: loader on first page, empty state, then rows of options plus a next-page loader. */
export function LabelPickerResults({
  loading,
  fetchingNextPage,
  labels,
  selectedIdSet,
  disabledIdSet,
  onToggle,
  onScroll,
}: LabelPickerResultsProps) {
  return (
    <div className={styles.listScroll} onScroll={onScroll}>
      {loading ? (
        <div className={styles.loaderRow}>
          <FetchingStaticLoader className={styles.initialFetch} />
        </div>
      ) : labels.length === 0 ? (
        <FetchEmptyState />
      ) : (
        <div className={styles.labelRows}>
          {chunkRows(labels, LABELS_PER_ROW).map((row, rowIndex) => (
            <ComicPageRow key={rowIndex} className={styles.labelRow}>
              {row.map((label) => (
                <LabelPickerOption
                  key={label.id}
                  label={label}
                  selected={selectedIdSet.has(label.id)}
                  disabled={disabledIdSet.has(label.id)}
                  onToggle={onToggle}
                />
              ))}
            </ComicPageRow>
          ))}
        </div>
      )}
      {fetchingNextPage ? (
        <div className={styles.nextPageRow}>
          <FetchingStaticLoader />
        </div>
      ) : null}
    </div>
  );
}
