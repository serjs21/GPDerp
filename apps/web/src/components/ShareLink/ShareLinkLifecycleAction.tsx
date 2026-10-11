"use client";

import { useTranslations } from "next-intl";
import { ComicPressButton } from "@/components/ComicPressButton";
import { ShareLinkBusyButton } from "./ShareLinkBusyButton";
import type { ShareLinkLifecycleActionProps } from "./ShareLinkLifecycleAction.types";
import { ShareLinkStartButton } from "./ShareLinkStartButton";
import styles from "./ShareLink.module.css";
import { PAUSE_ICON_SRC } from "./useShareLinkControls";
import { shareLinkLifecyclePhase } from "./utils/shareLinkCardUtils";

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
  restartReason,
  className,
}: ShareLinkLifecycleActionProps) {
  const t = useTranslations("ShareLink.lifecycle");
  const phase = shareLinkLifecyclePhase({ activating, deactivating, active });
  const blocked = isUpdating || busy;

  return (
    <div className={[styles.actionRow, className].filter(Boolean).join(" ")}>
      {phase === "stop" ? (
        <ComicPressButton
          className={[styles.actionButton, styles.stopButton, stopButtonClassName].filter(Boolean).join(" ")}
          disabled={blocked}
          onClick={() => void onStop()}
          aria-label={t("stopAriaLabel")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- action icon asset */}
          <img src={PAUSE_ICON_SRC} alt="" className={styles.actionIcon} aria-hidden />
          <span className={styles.actionLabel}>{t("stop")}</span>
        </ComicPressButton>
      ) : phase === "start" ? (
        <ShareLinkStartButton onStart={onStart} restartReason={restartReason} disabled={!formValid || blocked} />
      ) : (
        <ShareLinkBusyButton label={t(phase)} busyDots={busyDots} />
      )}
    </div>
  );
}
