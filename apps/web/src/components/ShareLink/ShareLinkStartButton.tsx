"use client";

import { useTranslations } from "next-intl";
import { ComicPressButton } from "@/components/ComicPressButton";
import { RestartLinkButton } from "@/components/RestartLinkButton";
import type { ShareLinkStartButtonProps } from "./ShareLinkStartButton.types";
import styles from "./ShareLink.module.css";
import { START_ICON_SRC } from "./useShareLinkControls";

/** Launch for a new link, or Restart (with its reason) for an expired / used-up one. */
export function ShareLinkStartButton({ onStart, restartReason, disabled }: ShareLinkStartButtonProps) {
  const t = useTranslations("ShareLink.lifecycle");

  if (restartReason) {
    return (
      <RestartLinkButton
        reason={restartReason}
        disabled={disabled}
        className={styles.restartButton}
        onClick={() => void onStart()}
      />
    );
  }

  return (
    <ComicPressButton
      className={styles.actionButton}
      disabled={disabled}
      onClick={() => void onStart()}
      aria-label={t("launchAriaLabel")}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- action icon asset */}
      <img src={START_ICON_SRC} alt="" className={styles.actionIcon} aria-hidden />
      <span className={styles.actionLabel}>{t("launch")}</span>
    </ComicPressButton>
  );
}
