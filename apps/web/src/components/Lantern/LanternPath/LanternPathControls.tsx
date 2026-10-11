"use client";

import { useTranslations } from "next-intl";
import { LANTERN_PATH_FOCUS_STOP } from "./lanternPath.config";
import type { LanternPathControlsProps } from "./LanternPathControls.types";
import styles from "./LanternPath.module.css";

/** Previous / next step buttons with the focus-stop position readout. */
export function LanternPathControls({
  focusIndex,
  haikuCount,
  canStepBack,
  canStepForward,
  onStepBack,
  onStepForward,
}: LanternPathControlsProps) {
  const t = useTranslations("Lantern.lanternPath");
  return (
    <div className={styles.flightPathControls}>
      <button
        type="button"
        className={styles.flightPathControlButton}
        aria-label={t("previous")}
        disabled={!canStepBack}
        onClick={onStepBack}
      >
        ←
      </button>
      <span className={styles.flightPathControlLabel}>
        stop-{LANTERN_PATH_FOCUS_STOP} ({focusIndex + 1} / {Math.max(haikuCount, 1)})
      </span>
      <button
        type="button"
        className={styles.flightPathControlButton}
        aria-label={t("next")}
        disabled={!canStepForward}
        onClick={onStepForward}
      >
        →
      </button>
    </div>
  );
}
