"use client";

import { useInvertedSvgUrl } from "./useInvertedSvgUrl";
import type { DualityToneIconProps } from "./DualityFaceIcon.types";
import styles from "./DualityButton.module.css";

/** Full-color artwork as authored, with a black/white-swapped copy for the dark face. */
export function DualityImageIcon({ src, placeClass, sizeStyle }: DualityToneIconProps) {
  const invertedSrc = useInvertedSvgUrl(src);
  return (
    <span className={[styles.icon, styles.iconImage, placeClass].join(" ")} style={sizeStyle} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
      <img className={styles.imageOnLight} src={src} alt="" draggable={false} decoding="async" />
      {invertedSrc ? (
        // eslint-disable-next-line @next/next/no-img-element -- generated SVG data URL
        <img className={styles.imageOnDark} src={invertedSrc} alt="" draggable={false} decoding="async" />
      ) : null}
    </span>
  );
}
