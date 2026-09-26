"use client";

import { ComicPagePanel } from "@/components/ComicPageLayout";
import { CoverState } from "@/components/DualityButton";
import {
  LABEL_SORT_CATEGORIES,
  LABEL_SORT_SIZE_REM,
  type LabelSortCategory,
  type LabelSortValue,
} from "./consts/labelSortConsts";
import styles from "./LabelSort.module.css";

export type LabelSortProps = {
  value: LabelSortValue;
  onChange: (next: LabelSortValue) => void;
  /** Override category list (defaults to Creation date / Alpacabet / Connection). */
  categories?: LabelSortCategory[];
  sizeRem?: number;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

/**
 * Row of CoverState sort coins for labels. One category uncovered at a time;
 * switching re-covers the previous coin and opens the new one. Clicking the
 * active DualityButton toggles asc/desc.
 */
export function LabelSort({
  value,
  onChange,
  categories = LABEL_SORT_CATEGORIES,
  sizeRem = LABEL_SORT_SIZE_REM,
  disabled = false,
  className,
  "aria-label": ariaLabel = "Sort labels",
}: LabelSortProps) {
  return (
    <ComicPagePanel
      title="Sort by"
      background="solid"
      color="white"
      contentAlign="center"
      overflowVisible
      className={[styles.panel, className].filter(Boolean).join(" ")}
      ariaLabel={ariaLabel}
    >
      <div className={styles.cluster} role="radiogroup" aria-label={ariaLabel}>
        {categories.map((category) => {
          const selected = category.id === value.categoryId;
          return (
            <CoverState
              key={category.id}
              className={styles.coin}
              iconSrc={category.coverSrc}
              title={category.title}
              sizeRem={sizeRem}
              uncovered={selected}
              onUncoveredChange={(open) => {
                if (!open) return;
                onChange({
                  categoryId: category.id,
                  direction: "asc",
                });
              }}
              flipped={selected && value.direction === "desc"}
              onFlippedChange={(flipped) => {
                if (!selected) return;
                onChange({
                  categoryId: category.id,
                  direction: flipped ? "desc" : "asc",
                });
              }}
              topIconSrc={category.topIconSrc}
              bottomIconSrc={category.bottomIconSrc}
              centerIconSrc={category.centerIconSrc}
              centerIconScale={category.centerIconScale}
              iconTone={category.iconTone}
              disabled={disabled}
              aria-label={category.ariaLabel}
              coverAriaLabel={`Select ${category.title}`}
            />
          );
        })}
      </div>
    </ComicPagePanel>
  );
}
