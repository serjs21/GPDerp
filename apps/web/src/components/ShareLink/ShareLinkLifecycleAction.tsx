"use client";

import { useTranslations } from "next-intl";
import { ComicPressButton } from "@/components/ComicPressButton";
import { RestartLinkButton } from "@/components/RestartLinkButton";
import type { ShareLinkLifecycleActionProps } from "./ShareLinkLifecycleAction.types";
import styles from "./ShareLink.module.css";
import { PAUSE_ICON_SRC, START_ICON_SRC } from "./useShareLinkControls";

/** Launch / Stop / Restart button for a share link, with in-flight states. */
export function ShareLinkLifecycleAction({
  formValid,
  activating,
  deactivating,
  active,
  busy,
  isUpdating,
  busyDots,
  onStart,
  onStop,
  stopButtonClassName,
  restartReason = null,
  className,
}: ShareLinkLifecycleActionProps) {
  const t = useTranslations("ShareLink.lifecycle");
  return (
    <div className={[styles.actionRow, className].filter(Boolean).join(" ")}>
      {activating ? (
        <ComicPressButton className={styles.actionButton} disabled aria-live="polite">
          <span className={styles.actionLabel}>
            {t("activating")}
            <span className={styles.activatingDots}>{busyDots}</span>
          </span>
        </ComicPressButton>
      ) : deactivating ? (
        <ComicPressButton className={styles.actionButton} disabled aria-live="polite">
          <span className={styles.actionLabel}>
            {t("stopping")}
            <span className={styles.activatingDots}>{busyDots}</span>
          </span>
        </ComicPressButton>
      ) : active ? (
        <ComicPressButton
          className={[styles.actionButton, stopButtonClassName].filter(Boolean).join(" ")}
          disabled={isUpdating || busy}
          onClick={() => void onStop()}
          aria-label={t("stopAriaLabel")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- action icon asset */}
          <img src={PAUSE_ICON_SRC} alt="" className={styles.actionIcon} aria-hidden />
          <span className={styles.actionLabel}>{t("stop")}</span>
        </ComicPressButton>
      ) : restartReason ? (
        <RestartLinkButton
          reason={restartReason}
          disabled={!formValid || isUpdating || busy}
          className={styles.restartButton}
          onClick={() => void onStart()}
        />
      ) : (
        <ComicPressButton
          className={styles.actionButton}
          disabled={!formValid || isUpdating || busy}
          onClick={() => void onStart()}
          aria-label={t("launchAriaLabel")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- action icon asset */}
          <img src={START_ICON_SRC} alt="" className={styles.actionIcon} aria-hidden />
          <span className={styles.actionLabel}>{t("launch")}</span>
        </ComicPressButton>
      )}
    </div>
  );
}
