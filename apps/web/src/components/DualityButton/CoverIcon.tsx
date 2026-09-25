"use client";

import type { CSSProperties } from "react";
import styles from "./CoverIcon.module.css";

export type CoverIconProps = {
  iconSrc: string;
  className?: string;
  style?: CSSProperties;
  /** When true, fades out (no leftover overlay over the face). */
  dismissing?: boolean;
};

/**
 * Circular cover disk seated exactly over the duality base (fill + icon).
 */
export function CoverIcon({
  iconSrc,
  className,
  style,
  dismissing = false,
}: CoverIconProps) {
  return (
    <span
      className={[
        styles.disk,
        dismissing ? styles.diskDismissing : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
      <img
        className={styles.icon}
        src={iconSrc}
        alt=""
        draggable={false}
        decoding="async"
      />
    </span>
  );
}
