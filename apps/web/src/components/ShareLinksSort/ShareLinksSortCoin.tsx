"use client";

import { useTranslations } from "next-intl";
import { CoverState } from "@/components/DualityButton";
import type { ShareLinksSortCoinProps } from "./ShareLinksSortCoin.types";
import styles from "./ShareLinksSort.module.css";

/** One sort category coin: uncovering selects it ascending; flipping the selected coin toggles asc/desc. */
export function ShareLinksSortCoin({
  category,
  value,
  onChange,
  titleFontSizeRem,
  sizeRem,
  disabled,
}: ShareLinksSortCoinProps) {
  const t = useTranslations("ShareLinksSort");
  const selected = category.id === value.categoryId;
  const title = t(`categories.${category.titleKey}`);

  const handleUncoveredChange = (open: boolean) => {
    if (!open) return;
    onChange({ categoryId: category.id, direction: "asc" });
  };

  const handleFlippedChange = (flipped: boolean) => {
    if (!selected) return;
    onChange({ categoryId: category.id, direction: flipped ? "desc" : "asc" });
  };

  return (
    <CoverState
      className={styles.coin}
      iconSrc={category.coverSrc}
      coverMirrored={category.coverMirrored}
      title={title}
      titleFontSizeRem={titleFontSizeRem}
      sizeRem={sizeRem}
      uncovered={selected}
      onUncoveredChange={handleUncoveredChange}
      flipped={selected && value.direction === "desc"}
      onFlippedChange={handleFlippedChange}
      topIconSrc={category.topIconSrc}
      bottomIconSrc={category.bottomIconSrc}
      centerIconSrc={category.centerIconSrc}
      centerIconScale={category.centerIconScale}
      iconTone={category.iconTone}
      disabled={disabled}
      aria-label={t(`categories.${category.ariaLabelKey}`)}
      coverAriaLabel={t("coverAriaLabel", { title })}
    />
  );
}
