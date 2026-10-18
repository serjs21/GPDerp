"use client";

import { useTranslations } from "next-intl";
import styles from "./OverlayNextLabel.module.css";

export type OverlayNextLabelProps = {
  className?: string;
};

/** Path overlay “continue” cue — own styles; do not share with OverlayPrevLabel. */
export function OverlayNextLabel({ className }: OverlayNextLabelProps) {
  const t = useTranslations("PathOverlay.overlayNextLabel");
  const rootClass = [styles.root, className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      <span className={styles.label}>{t("label")}</span>
      <span className={styles.icon} aria-hidden />
    </div>
  );
}
