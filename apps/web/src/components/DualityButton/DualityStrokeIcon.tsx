"use client";

import { useStrokeInvertSvg } from "./utils/strokeInvertSvg";
import type { DualityToneIconProps } from "./DualityFaceIcon.types";
import styles from "./DualityButton.module.css";

/** Inline SVG where only black ink flips; light fills stay as authored. */
export function DualityStrokeIcon({ src, placeClass, sizeStyle }: DualityToneIconProps) {
  const strokeMarkup = useStrokeInvertSvg(src);
  return (
    <span
      className={[styles.icon, styles.iconRich, placeClass].join(" ")}
      style={sizeStyle}
      dangerouslySetInnerHTML={strokeMarkup ? { __html: strokeMarkup } : undefined}
      aria-hidden
    />
  );
}
