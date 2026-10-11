"use client";

import { withDefaults } from "@/utils/props/withDefaults";
import { DUALITY_BUTTON_BASE_SRC, DUALITY_BUTTON_DIRECTION_SRC } from "./consts/dualityButtonConsts";
import { DualityEndIcons } from "./DualityEndIcons";
import { DualityFaceIcon } from "./DualityFaceIcon";
import type { DualityButtonProps } from "./DualityButton.types";
import { useDualityFlip } from "./useDualityFlip";
import { dualityButtonClassName, dualityButtonRootStyle } from "./utils/dualityButtonUtils";
import styles from "./DualityButton.module.css";

export type { DualityButtonProps } from "./DualityButton.types";

const DUALITY_BUTTON_DEFAULTS = {
  iconTone: "mask",
  defaultFlipped: false,
  showDirection: true,
  disabled: false,
} as const;

export function DualityButton(props: DualityButtonProps) {
  const { topIconSrc, bottomIconSrc, centerIconSrc, iconTone, defaultFlipped, showDirection, disabled, className } =
    withDefaults(props, DUALITY_BUTTON_DEFAULTS);
  const { clockwiseDeg, flipped, onClick } = useDualityFlip({
    flippedProp: props.flipped,
    defaultFlipped,
    disabled,
    onFlippedChange: props.onFlippedChange,
  });

  return (
    <button
      type="button"
      className={dualityButtonClassName(styles, flipped, className)}
      style={dualityButtonRootStyle(props.style, clockwiseDeg)}
      aria-label={props["aria-label"]}
      aria-pressed={flipped}
      disabled={disabled}
      onClick={onClick}
    >
      <span className={styles.baseWrap} aria-hidden>
        {showDirection ? (
          // eslint-disable-next-line @next/next/no-img-element -- static public SVG
          <img
            className={styles.direction}
            src={DUALITY_BUTTON_DIRECTION_SRC}
            alt=""
            draggable={false}
            decoding="async"
          />
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
        <img
          className={styles.base}
          src={DUALITY_BUTTON_BASE_SRC}
          alt=""
          draggable={false}
          decoding="async"
        />
        {centerIconSrc ? (
          <DualityFaceIcon src={centerIconSrc} position="center" tone={iconTone} scale={1.2} />
        ) : null}
      </span>
      {centerIconSrc ? null : (
        <DualityEndIcons topIconSrc={topIconSrc} bottomIconSrc={bottomIconSrc} iconTone={iconTone} />
      )}
    </button>
  );
}
