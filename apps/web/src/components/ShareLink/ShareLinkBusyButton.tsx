"use client";

import { ComicPressButton } from "@/components/ComicPressButton";
import type { ShareLinkBusyButtonProps } from "./ShareLinkBusyButton.types";
import styles from "./ShareLink.module.css";

/** Disabled action button showing an in-flight label with cycling dots. */
export function ShareLinkBusyButton({ label, busyDots, className }: ShareLinkBusyButtonProps) {
  return (
    <ComicPressButton className={className ?? styles.actionButton} disabled aria-live="polite">
      <span className={styles.actionLabel}>
        {label}
        <span className={styles.activatingDots}>{busyDots}</span>
      </span>
    </ComicPressButton>
  );
}
