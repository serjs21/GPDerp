"use client";

import { useTranslations } from "next-intl";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import { coverLabelSharedFontSizeRem } from "@/components/DualityButton";
import { useElementWidth } from "@/hooks/useElementWidth";
import { useLocale } from "@/hooks/useLocale";
import { useVisualReadiness } from "@/hooks/useVisualReadiness";
import { CONTROL_ART_MAX_WAIT_MS } from "@/consts/visualReadiness/criticalAssets";
import { withDefaults } from "@/utils/props/withDefaults";
import { rotatedSortCoinSizeRem } from "@/utils/sort/rotatedSortUtils";
import {
  SHARE_LINKS_SORT_SIZE_REM,
  type ShareLinksSortCategory,
  type ShareLinksSortValue,
} from "./consts/shareLinksSortConsts";
import { ShareLinksSortCoin } from "./ShareLinksSortCoin";
import { shareLinksSortLayout } from "./utils/shareLinksSortLayoutUtils";
import { resolveShareLinksSortCategories } from "./utils/shareLinksSortLocaleUtils";

export type ShareLinksSortProps = {
  value: ShareLinksSortValue;
  onChange: (next: ShareLinksSortValue) => void;
  categories?: ShareLinksSortCategory[];
  sizeRem?: number;
  disabled?: boolean;
  rotated?: boolean;
  className?: string;
  "aria-label"?: string;
};

const SHARE_LINKS_SORT_DEFAULTS = {
  sizeRem: SHARE_LINKS_SORT_SIZE_REM,
  disabled: false,
  rotated: false,
};

/**
 * Row of CoverState sort coins. One category uncovered at a time; switching
 * re-covers the previous coin (title back) and opens the new one. Clicking the
 * active DualityButton toggles asc/desc.
 */
export function ShareLinksSort(props: ShareLinksSortProps) {
  const { sizeRem, disabled, rotated, className } = withDefaults(props, SHARE_LINKS_SORT_DEFAULTS);
  const t = useTranslations("ShareLinksSort");
  const ariaLabel = props["aria-label"] ?? t("ariaLabel");
  const { locale } = useLocale();
  const categories = props.categories ?? resolveShareLinksSortCategories(locale);
  const [clusterRef, clusterWidth] = useElementWidth<HTMLDivElement>(rotated);
  const coinSizeRem = rotatedSortCoinSizeRem(clusterWidth, sizeRem);
  const titleFontSizeRem = coverLabelSharedFontSizeRem(
    categories.map((category) => t(`categories.${category.titleKey}`)),
    coinSizeRem,
  );
  const coverArt = useVisualReadiness({
    criticalAssets: categories.map((category) => ({ src: category.coverSrc })),
    maxWaitMs: CONTROL_ART_MAX_WAIT_MS,
  });
  const layout = shareLinksSortLayout({
    rotated,
    coinSizeRem,
    className,
    coversPending: coverArt.status === "loading",
  });

  return (
    <ComicPagePanel
      title={t("title")}
      titleDirection={layout.titleDirection}
      background="solid"
      color="#58adff"
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
        {categories.map((category) => (
          <ShareLinksSortCoin
            key={category.id}
            category={category}
            value={props.value}
            onChange={props.onChange}
            titleFontSizeRem={titleFontSizeRem}
            sizeRem={coinSizeRem}
            disabled={disabled}
          />
        ))}
      </div>
    </ComicPagePanel>
  );
}
