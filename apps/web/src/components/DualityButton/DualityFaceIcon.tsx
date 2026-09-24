"use client";

import type { CSSProperties } from "react";
import { useStrokeInvertSvg } from "./utils/strokeInvertSvg";
import styles from "./DualityButton.module.css";

export type DualityIconTone = "mask" | "strokeInvert";

export type DualityFaceIconProps = {
  src: string;
  position: "top" | "bottom";
  /** `mask` tints the whole glyph; `strokeInvert` only flips black strokes. */
  tone?: DualityIconTone;
};

export function DualityFaceIcon({
  src,
  position,
  tone = "mask",
}: DualityFaceIconProps) {
  const strokeMarkup = useStrokeInvertSvg(tone === "strokeInvert" ? src : "");
  const positionClass = position === "top" ? styles.iconTop : styles.iconBottom;

  if (tone === "strokeInvert") {
    return (
      <span
        className={[styles.icon, styles.iconRich, positionClass].join(" ")}
        dangerouslySetInnerHTML={
          strokeMarkup ? { __html: strokeMarkup } : undefined
        }
        aria-hidden
      />
    );
  }

  return (
    <span
      className={[styles.icon, styles.iconMask, positionClass].join(" ")}
      style={
        {
          WebkitMaskImage: `url("${src}")`,
          maskImage: `url("${src}")`,
        } as CSSProperties
      }
      aria-hidden
    />
  );
}
