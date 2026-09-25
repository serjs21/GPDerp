"use client";

import type { CSSProperties } from "react";
import styles from "./CoverIcon.module.css";

export type CoverIconProps = {
  iconSrc: string;
  /** Round label fill. Defaults to paper white. */
  backgroundColor?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * Circular cover disk — front face of the CoverState coin.
 */
export function CoverIcon({
  iconSrc,
  backgroundColor,
  className,
  style,
}: CoverIconProps) {
  const diskStyle = (
    backgroundColor
      ? { ...style, "--cover-icon-bg-color": backgroundColor }
      : style
  ) as CSSProperties | undefined;

  return (
    <span
      className={[styles.disk, className].filter(Boolean).join(" ")}
      style={diskStyle}
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
