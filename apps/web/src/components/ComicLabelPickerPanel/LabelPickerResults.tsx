"use client";

import { useTranslations } from "next-intl";
import { ComicPageRow } from "@/components/ComicPageLayout";
import { SakuraPetalLoader } from "@/components/Loaders";
import { LabelPickerOption } from "./LabelPickerOption";
import type { LabelPickerResultsProps } from "./LabelPickerResults.types";
import { chunkRows } from "./utils/labelPickerUtils";
import styles from "./ComicLabelPickerPanel.module.css";

const LABELS_PER_ROW = 3;

/** Scrollable label grid: loader on first page, empty copy, then rows of options plus a next-page loader. */
export function LabelPickerResults({
  loading,
  fetchingNextPage,
  labels,
  selectedIdSet,
  disabledIdSet,
  onToggle,
  onScroll,
}: LabelPickerResultsProps) {
  const t = useTranslations("ComicLabelPickerPanel");

  return (
    <div className={styles.listScroll} onScroll={onScroll}>
      {loading ? (
        <div className={styles.loaderRow}>
          <SakuraPetalLoader />
        </div>
      ) : labels.length === 0 ? (
        <p className={styles.empty}>{t("empty")}</p>
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
          <SakuraPetalLoader />
        </div>
      ) : null}
    </div>
  );
}
