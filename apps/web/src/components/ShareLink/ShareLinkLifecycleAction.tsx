"use client";

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
  return (
    <div className={[styles.actionRow, className].filter(Boolean).join(" ")}>
      {activating ? (
        <button type="button" className={styles.actionButton} disabled aria-live="polite">
          <span className={styles.actionLabel}>
            Activating
            <span className={styles.activatingDots}>{busyDots}</span>
          </span>
        </button>
      ) : deactivating ? (
        <button type="button" className={styles.actionButton} disabled aria-live="polite">
          <span className={styles.actionLabel}>
            Stopping
            <span className={styles.activatingDots}>{busyDots}</span>
          </span>
        </button>
      ) : active ? (
        <button
          type="button"
          className={[styles.actionButton, stopButtonClassName].filter(Boolean).join(" ")}
          disabled={isUpdating || busy}
          onClick={() => void onStop()}
          aria-label="Stop link"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- action icon asset */}
          <img src={PAUSE_ICON_SRC} alt="" className={styles.actionIcon} aria-hidden />
          <span className={styles.actionLabel}>Stop</span>
        </button>
      ) : restartReason ? (
        <RestartLinkButton
          reason={restartReason}
          disabled={!formValid || isUpdating || busy}
          className={styles.restartButton}
          onClick={() => void onStart()}
        />
      ) : (
        <button
          type="button"
          className={styles.actionButton}
          disabled={!formValid || isUpdating || busy}
          onClick={() => void onStart()}
          aria-label="Launch link"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- action icon asset */}
          <img src={START_ICON_SRC} alt="" className={styles.actionIcon} aria-hidden />
          <span className={styles.actionLabel}>Launch</span>
        </button>
      )}
    </div>
  );
}
