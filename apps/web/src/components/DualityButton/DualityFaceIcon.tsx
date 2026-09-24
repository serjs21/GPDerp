"use client";

import type { CSSProperties } from "react";
import { useStrokeInvertSvg } from "./utils/strokeInvertSvg";
import styles from "./DualityButton.module.css";

export type DualityIconTone = "mask" | "strokeInvert";

export type DualityFaceIconPosition = "top" | "bottom" | "center";

export type DualityFaceIconProps = {
  src: string;
  position: DualityFaceIconPosition;
  /** `mask` tints the whole glyph; `strokeInvert` only flips black ink. */
  tone?: DualityIconTone;
  /** Size multiplier vs the default end icons (center time glyph uses 2). */
  scale?: number;
};

function positionClass(position: DualityFaceIconPosition): string {
  if (position === "top") return styles.iconTop;
  if (position === "bottom") return styles.iconBottom;
  return styles.iconCenter;
}

export function DualityFaceIcon({
  src,
  position,
  tone = "mask",
  scale = 1,
}: DualityFaceIconProps) {
  const strokeMarkup = useStrokeInvertSvg(tone === "strokeInvert" ? src : "");
  const placeClass = positionClass(position);
  const sizeStyle =
    scale !== 1
      ? ({
          "--duality-icon-scale": String(scale),
        } as CSSProperties)
      : undefined;

  if (tone === "strokeInvert") {
    return (
      <span
        className={[styles.icon, styles.iconRich, placeClass].join(" ")}
        style={sizeStyle}
        dangerouslySetInnerHTML={
          strokeMarkup ? { __html: strokeMarkup } : undefined
        }
        aria-hidden
      />
    );
  }

  return (
    <span
      className={[styles.icon, styles.iconMask, placeClass].join(" ")}
      style={
        {
          ...sizeStyle,
          WebkitMaskImage: `url("${src}")`,
          maskImage: `url("${src}")`,
        } as CSSProperties
      }
      aria-hidden
    />
  );
}
