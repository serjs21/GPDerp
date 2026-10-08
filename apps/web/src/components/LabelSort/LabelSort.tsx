"use client";

import { useTranslations } from "next-intl";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import type {
  ComicPanelBackground,
  ComicPanelColor,
} from "@/components/ComicPageLayout/comicPagePresets";
import { CoverState } from "@/components/DualityButton";
import { useElementWidth } from "@/hooks/useElementWidth";
import { useLocale } from "@/hooks/useLocale";
import {
  buildRotatedSortClusterStyle,
  rotatedSortCoinSizeRem,
} from "@/utils/sort/rotatedSortUtils";
import {
  LABEL_SORT_SIZE_REM,
  type LabelSortCategory,
  type LabelSortValue,
} from "./consts/labelSortConsts";
import { resolveLabelSortCategories } from "./utils/labelSortLocaleUtils";
import styles from "./LabelSort.module.css";

export type LabelSortProps = {
  value: LabelSortValue;
  onChange: (next: LabelSortValue) => void;
  /** Override category list (defaults to Creation date / Alpacabet / Connection). */
  categories?: LabelSortCategory[];
  sizeRem?: number;
  disabled?: boolean;
  /** Panel title (defaults to "Sort by"). */
  title?: string;
  /** Horizontal (unrotated) title with the sort coins stacked in a column. */
  rotated?: boolean;
  color?: ComicPanelColor;
  background?: ComicPanelBackground;
  className?: string;
  /** Extra class on the coin column (spacing overrides). */
  clusterClassName?: string;
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
  categories: categoriesProp,
  sizeRem = LABEL_SORT_SIZE_REM,
  disabled = false,
  title,
  rotated = false,
  color = "white",
  background = "solid",
  className,
  clusterClassName,
  "aria-label": ariaLabelProp,
}: LabelSortProps) {
  const t = useTranslations("LabelSort");
  const ariaLabel = ariaLabelProp ?? t("ariaLabel");
  const { locale } = useLocale();
  const categories = categoriesProp ?? resolveLabelSortCategories(locale, t);
  const [clusterRef, clusterWidth] = useElementWidth<HTMLDivElement>(rotated);
  const coinSizeRem = rotatedSortCoinSizeRem(clusterWidth, sizeRem);
  return (
    <ComicPagePanel
      title={title ?? t("title")}
      titleDirection={rotated ? "horizontal" : "vertical"}
      background={background}
      color={color}
      contentAlign="center"
      overflowVisible
      className={[styles.panel, rotated ? styles.panelRotated : "", className]
        .filter(Boolean)
        .join(" ")}
      ariaLabel={ariaLabel}
    >
      <div
        ref={clusterRef}
        className={[styles.cluster, rotated ? styles.clusterRotated : "", clusterClassName]
          .filter(Boolean)
          .join(" ")}
        style={rotated ? buildRotatedSortClusterStyle(coinSizeRem) : undefined}
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
              sizeRem={coinSizeRem}
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
              coverAriaLabel={t("selectCategory", { title: category.title })}
            />
          );
        })}
      </div>
    </ComicPagePanel>
  );
}
