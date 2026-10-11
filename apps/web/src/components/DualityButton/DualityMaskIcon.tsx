import type { DualityToneIconProps } from "./DualityFaceIcon.types";
import { dualityMaskIconStyle } from "./utils/dualityFaceIconUtils";
import styles from "./DualityButton.module.css";

/** Mono glyph tinted via CSS mask (black/white swap on flip). */
export function DualityMaskIcon({ src, placeClass, sizeStyle }: DualityToneIconProps) {
  return (
    <span
      className={[styles.icon, styles.iconMask, placeClass].join(" ")}
      style={dualityMaskIconStyle(sizeStyle, src)}
      aria-hidden
    />
  );
}
