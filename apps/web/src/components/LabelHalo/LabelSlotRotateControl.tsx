"use client";

import { useTranslations } from "next-intl";
import { LABEL_HALO_ROTATE_ICON_SRC } from "./consts/labelHaloConsts";
import type { LabelSlotRotateControlProps } from "./LabelSlotRotateControl.types";
import styles from "./LabelSlot.module.css";

/**
 * Rotate handle the RotationTable drags around the label. RotationTable injects pointer handlers
 * into its `control` element, so they must reach the button.
 */
export function LabelSlotRotateControl({ visible, disabled, ...pointerHandlers }: LabelSlotRotateControlProps) {
  const t = useTranslations("LabelHalo.slot");

  return (
    <button
      type="button"
      className={styles.rotateControl}
      tabIndex={visible && !disabled ? 0 : -1}
      aria-label={t("rotateAriaLabel")}
      aria-hidden={!visible}
      disabled={disabled}
      {...pointerHandlers}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG asset */}
      <img className={styles.rotateIcon} src={LABEL_HALO_ROTATE_ICON_SRC} alt="" draggable={false} />
    </button>
  );
}
