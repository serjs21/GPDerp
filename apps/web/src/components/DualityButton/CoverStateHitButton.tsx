"use client";

import { useTranslations } from "next-intl";
import type { CoverStateHitButtonProps } from "./CoverState.types";
import styles from "./CoverState.module.css";

/** Full-coin hit target that uncovers the coin while the cover is up. */
export function CoverStateHitButton({ title, coverAriaLabel, disabled, onClick }: CoverStateHitButtonProps) {
  const t = useTranslations("DualityButton.coverState");
  return (
    <button
      type="button"
      className={styles.hit}
      aria-label={coverAriaLabel ?? t("reveal", { title })}
      disabled={disabled}
      onClick={onClick}
    />
  );
}
