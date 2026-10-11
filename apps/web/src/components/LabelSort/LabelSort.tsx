"use client";

import { useTranslations } from "next-intl";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import type {
  ComicPanelBackground,
  ComicPanelColor,
} from "@/components/ComicPageLayout/comicPagePresets";
import { CoverState, coverLabelSharedFontSizeRem } from "@/components/DualityButton";
import { useElementWidth } from "@/hooks/useElementWidth";
import { useLocale } from "@/hooks/useLocale";
import { rotatedSortCoinSizeRem } from "@/utils/sort/rotatedSortUtils";
import { withDefaults } from "@/utils/props/withDefaults";
import {
  LABEL_SORT_SIZE_REM,
  type LabelSortCategory,
  type LabelSortValue,
} from "./consts/labelSortConsts";
import { resolveLabelSortCategories } from "./utils/labelSortLocaleUtils";
import { labelSortLayout } from "./utils/labelSortLayoutUtils";
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

const LABEL_SORT_DEFAULTS = {
  sizeRem: LABEL_SORT_SIZE_REM,
  disabled: false,
  rotated: false,
  color: "white",
  background: "solid",
} as const;

/**
 * Row of CoverState sort coins for labels. One category uncovered at a time;
 * switching re-covers the previous coin and opens the new one. Clicking the
 * active DualityButton toggles asc/desc.
 */
export function LabelSort(props: LabelSortProps) {
  const { sizeRem, disabled, rotated, color, background } = withDefaults(props, LABEL_SORT_DEFAULTS);
  const { value, onChange } = props;
  const t = useTranslations("LabelSort");
  const ariaLabel = props["aria-label"] ?? t("ariaLabel");
  const { locale } = useLocale();
  const categories = props.categories ?? resolveLabelSortCategories(locale, t);
  const [clusterRef, clusterWidth] = useElementWidth<HTMLDivElement>(rotated);
  const coinSizeRem = rotatedSortCoinSizeRem(clusterWidth, sizeRem);
  const titleFontSizeRem = coverLabelSharedFontSizeRem(
    categories.map((category) => category.title),
    coinSizeRem,
  );
  const layout = labelSortLayout({
    rotated,
    coinSizeRem,
    className: props.className,
    clusterClassName: props.clusterClassName,
  });

  return (
    <ComicPagePanel
      title={props.title ?? t("title")}
      titleDirection={layout.titleDirection}
      background={background}
      color={color}
      contentAlign="center"
      overflowVisible
      className={layout.panelClassName}
      ariaLabel={ariaLabel}
    >
      <div
        ref={clusterRef}
        className={layout.clusterClassName}
        style={layout.clusterStyle}
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
              titleFontSizeRem={titleFontSizeRem}
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
