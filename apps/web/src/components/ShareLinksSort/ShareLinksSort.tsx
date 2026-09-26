"use client";

import { CoverState } from "@/components/DualityButton";
import {
  SHARE_LINKS_SORT_CATEGORIES,
  SHARE_LINKS_SORT_SIZE_REM,
  type ShareLinksSortCategory,
  type ShareLinksSortValue,
} from "./consts/shareLinksSortConsts";
import styles from "./ShareLinksSort.module.css";

export type ShareLinksSortProps = {
  value: ShareLinksSortValue;
  onChange: (next: ShareLinksSortValue) => void;
  /** Override category list (defaults to Creation date / Alpacabeth / Hits left / Time left). */
  categories?: ShareLinksSortCategory[];
  sizeRem?: number;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

/**
 * Row of CoverState sort coins. One category uncovered at a time; switching
 * re-covers the previous coin (title back) and opens the new one. Clicking the
 * active DualityButton toggles asc/desc.
 */
export function ShareLinksSort({
  value,
  onChange,
  categories = SHARE_LINKS_SORT_CATEGORIES,
  sizeRem = SHARE_LINKS_SORT_SIZE_REM,
  disabled = false,
  className,
  "aria-label": ariaLabel = "Sort share links",
}: ShareLinksSortProps) {
  return (
    <div
      className={[styles.cluster, className].filter(Boolean).join(" ")}
      role="radiogroup"
      aria-label={ariaLabel}
    >
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
  );
}
