"use client";

import { useTranslations } from "next-intl";
import styles from "./OverlayPrevLabel.module.css";

export type OverlayPrevLabelProps = {
  className?: string;
};

/** Path overlay “return” cue — own styles; do not share with OverlayNextLabel. */
export function OverlayPrevLabel({ className }: OverlayPrevLabelProps) {
  const t = useTranslations("PathOverlay.overlayPrevLabel");
  const rootClass = [styles.root, className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      <span className={styles.label}>{t("label")}</span>
      <span className={styles.icon} aria-hidden />
    </div>
  );
}
