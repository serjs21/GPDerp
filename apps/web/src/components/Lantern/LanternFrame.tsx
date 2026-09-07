"use client";

import { memo, type CSSProperties, type ReactNode } from "react";
import {
  LANTERN_ASSET_SRC,
  LANTERN_FLAME_ANCHOR_Y,
  LANTERN_FLAME_BOTTOM,
  LANTERN_FLAME_HEIGHT,
  LANTERN_IMAGE_HEIGHT,
  LANTERN_IMAGE_WIDTH,
  LANTERN_WIDTH_REM,
} from "./constants";
import { LabelBelt, toLabelBeltItems, type LabelBeltItem } from "./LabelBelt";
import {
  lanternTransformToCssVars,
  resolveLanternTransform,
  type LanternTransform,
  type LanternTransformInput,
} from "./lanternTransform";
import styles from "./Lantern.module.css";

export type LanternFrameLabelSource = {
  id: string;
  name: string;
  color?: string | null;
  shape?: string | null;
};

export type LanternFrameProps = LanternTransformInput & {
  className?: string;
  style?: CSSProperties;
  ariaLabel: string;
  widthRem?: number;
  generating?: boolean;
  flightExiting?: boolean;
  /** Prebuilt belt items (stories). Prefer `haikuLabels` on the path hot path. */
  labels?: LabelBeltItem[];
  /** Raw haiku labels; converted inside a memo boundary so tween frames skip the belt. */
  haikuLabels?: ReadonlyArray<LanternFrameLabelSource>;
  excludeLabelIds?: string[];
  children: ReactNode;
};

const LanternFrameShell = memo(function LanternFrameShell() {
  return (
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
  );
});

const LanternFrameBelt = memo(function LanternFrameBelt({
  labels,
  haikuLabels,
  excludeLabelIds,
}: {
  labels?: LabelBeltItem[];
  haikuLabels?: ReadonlyArray<LanternFrameLabelSource>;
  excludeLabelIds?: string[];
}) {
  const beltItems = labels?.length
    ? labels
    : haikuLabels?.length
      ? toLabelBeltItems(haikuLabels, excludeLabelIds)
      : null;
  if (!beltItems || beltItems.length === 0) return null;
  return <LabelBelt labels={beltItems} />;
});

export function LanternFrame({
  className,
  style,
  ariaLabel,
  widthRem = LANTERN_WIDTH_REM,
  generating = false,
  flightExiting = false,
  labels,
  haikuLabels,
  excludeLabelIds,
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
      <LanternFrameShell />
      <div className={styles.content}>{children}</div>
      <LanternFrameBelt
        labels={labels}
        haikuLabels={haikuLabels}
        excludeLabelIds={excludeLabelIds}
      />
    </article>
  );
}

export type { LanternTransform };
