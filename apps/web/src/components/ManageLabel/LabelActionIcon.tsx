"use client";

import type { CSSProperties } from "react";
import type { LabelActionIconProps } from "./LabelActionIcon.types";
import styles from "./LabelActions.module.css";

/** Action glyph: the raw SVG, or an ink-on-sky mask of it for sky-colored panels. */
export function LabelActionIcon({ src, iconClassName, inkOnSky }: LabelActionIconProps) {
  if (inkOnSky) {
    return (
      <span
        className={[styles.icon, styles.iconInkOnSky, iconClassName].join(" ")}
        style={{ "--label-action-icon-mask": `url("${src}")` } as CSSProperties}
        aria-hidden
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static public SVG
    <img className={[styles.icon, iconClassName].join(" ")} src={src} alt="" draggable={false} decoding="async" />
  );
}
