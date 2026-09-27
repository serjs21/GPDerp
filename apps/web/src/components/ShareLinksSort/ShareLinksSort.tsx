"use client";

import { ComicPagePanel } from "@/components/ComicPageLayout";
import { CoverState } from "@/components/DualityButton";
import { useLocale } from "@/hooks/useLocale";
import {
  SHARE_LINKS_SORT_SIZE_REM,
  type ShareLinksSortCategory,
  type ShareLinksSortValue,
} from "./consts/shareLinksSortConsts";
import { resolveShareLinksSortCategories } from "./utils/shareLinksSortLocaleUtils";
import styles from "./ShareLinksSort.module.css";

export type ShareLinksSortProps = {
  value: ShareLinksSortValue;
  onChange: (next: ShareLinksSortValue) => void;
  /** Override category list (defaults to Creation date / Alpacabeth / Hits left / Time left). */
  categories?: ShareLinksSortCategory[];
  sizeRem?: number;
  disabled?: boolean;
  /** Horizontal (unrotated) title with the sort coins stacked in a column. */
  rotated?: boolean;
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
  categories: categoriesProp,
  sizeRem = SHARE_LINKS_SORT_SIZE_REM,
  disabled = false,
  rotated = false,
  className,
  "aria-label": ariaLabel = "Sort share links",
}: ShareLinksSortProps) {
  const { locale } = useLocale();
  const categories = categoriesProp ?? resolveShareLinksSortCategories(locale);
  return (
    <ComicPagePanel
      title="Sort by"
      titleDirection={rotated ? "horizontal" : "vertical"}
      background="solid"
      color="white"
      contentAlign="center"
      overflowVisible
      className={[styles.panel, rotated ? styles.panelRotated : "", className]
        .filter(Boolean)
        .join(" ")}
      ariaLabel={ariaLabel}
    >
      <div
        className={[styles.cluster, rotated ? styles.clusterRotated : ""]
          .filter(Boolean)
          .join(" ")}
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
              coverMirrored={category.coverMirrored}
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
