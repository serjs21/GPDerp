"use client";

import { useTranslations } from "next-intl";
import { ComicPressButton } from "@/components/ComicPressButton";
import type { ShareLinkUpdateLimitsButtonProps } from "./ShareLinkUpdateLimitsButton.types";
import styles from "./ShareLink.module.css";
import { UPDATE_ICON_SRC } from "./useShareLinkControls";

export function ShareLinkUpdateLimitsButton({
  updatingLimits,
  busyDots,
  onUpdateLimits,
  formValid,
  isUpdating,
  busy,
}: ShareLinkUpdateLimitsButtonProps) {
  const t = useTranslations("ShareLink.settings");
  return (
    <ComicPressButton
      className={styles.updateButton}
      disabled={!formValid || isUpdating || busy}
      onClick={() => void onUpdateLimits()}
      aria-label={t("updateAriaLabel")}
      aria-live="polite"
    >
      {updatingLimits ? (
        <span className={styles.actionLabel}>
          {t("updating")}
          <span className={styles.activatingDots}>{busyDots}</span>
        </span>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- action icon asset */}
          <img src={UPDATE_ICON_SRC} alt="" className={styles.actionIcon} aria-hidden />
          <span className={styles.actionLabel}>{t("update")}</span>
        </>
      )}
    </ComicPressButton>
  );
}
