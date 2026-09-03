"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  LANTERN_ASSET_SRC,
  LANTERN_FLAME_ANCHOR_Y,
  LANTERN_FLAME_BOTTOM,
  LANTERN_FLAME_HEIGHT,
  LANTERN_IMAGE_HEIGHT,
  LANTERN_IMAGE_WIDTH,
  LANTERN_WIDTH_REM,
} from "./constants";
import { LabelBelt, type LabelBeltItem } from "./LabelBelt";
import {
  lanternTransformToCssVars,
  resolveLanternTransform,
  type LanternTransform,
  type LanternTransformInput,
} from "./lanternTransform";
import styles from "./Lantern.module.css";

export type LanternFrameProps = LanternTransformInput & {
  className?: string;
  style?: CSSProperties;
  ariaLabel: string;
  widthRem?: number;
  generating?: boolean;
  flightExiting?: boolean;
  /** Comic labels rendered in an upper-half arc around this frame. */
  labels?: LabelBeltItem[];
  children: ReactNode;
};

export function LanternFrame({
  className,
  style,
  ariaLabel,
  widthRem = LANTERN_WIDTH_REM,
  generating = false,
  flightExiting = false,
  labels,
  children,
  step,
  progress,
  journeyS,
  maxSteps,
  transform,
}: LanternFrameProps) {
  const resolved = resolveLanternTransform({
    step,
    progress,
    journeyS,
    maxSteps,
    transform,
  });

  const rootStyle = {
    ...lanternTransformToCssVars(resolved),
    "--lantern-width": `${widthRem}rem`,
    "--lantern-flame-bottom": String(LANTERN_FLAME_BOTTOM),
    "--lantern-flame-height": String(LANTERN_FLAME_HEIGHT),
    "--lantern-flame-anchor-y": String(LANTERN_FLAME_ANCHOR_Y),
    ...style,
  } as CSSProperties;

  const rootClass = [
    styles.root,
    resolved.positionMode === "percent" ? styles.pathPositioned : "",
    flightExiting ? styles.flightExiting : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      className={rootClass}
      style={rootStyle}
      aria-label={ariaLabel}
      {...(generating ? { "data-haiku-generating": true } : {})}
    >
      <div className={styles.shell} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative lantern art from /public */}
        <img
          className={styles.image}
          src={LANTERN_ASSET_SRC}
          alt=""
          width={LANTERN_IMAGE_WIDTH}
          height={LANTERN_IMAGE_HEIGHT}
          draggable={false}
          decoding="async"
        />
        <span className={styles.flame} />
      </div>

      <div className={styles.content}>{children}</div>
      {labels && labels.length > 0 ? <LabelBelt labels={labels} /> : null}
    </article>
  );
}

export type { LanternTransform };
