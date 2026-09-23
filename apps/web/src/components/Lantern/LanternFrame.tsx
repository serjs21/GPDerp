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
import { LanternActionsDockProvider } from "./LanternActionsDockContext";
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
  /** Skip lanternReveal only (keeps pointer events). */
  suppressReveal?: boolean;
  /** Horizontal offset of the actions bar relative to lantern center. */
  actionsBarOffsetX?: string;
  /** Vertical gap between lantern bottom and actions bar. */
  actionsBarOffsetY?: string;
  /** Prebuilt belt items (stories). Prefer `haikuLabels` on the path hot path. */
  labels?: LabelBeltItem[];
  /** Raw haiku labels; converted inside a memo boundary so tween frames skip the belt. */
  haikuLabels?: ReadonlyArray<LanternFrameLabelSource>;
  excludeLabelIds?: string[];
  /** When false, skip LabelBelt (LabelHalo owns label chrome). Default true. */
  showLabelBelt?: boolean;
  /** Marks this frame for path handoff DOM measurements. */
  pathHaikuId?: string;
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
  suppressReveal = false,
  actionsBarOffsetX,
  actionsBarOffsetY,
  labels,
  haikuLabels,
  excludeLabelIds,
  showLabelBelt = true,
  pathHaikuId,
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
    ...(actionsBarOffsetX != null
      ? { "--lantern-actions-bar-offset-x": actionsBarOffsetX }
      : {}),
    ...(actionsBarOffsetY != null
      ? { "--lantern-actions-bar-offset-y": actionsBarOffsetY }
      : {}),
    ...style,
  } as CSSProperties;

  const rootClass = [
    styles.root,
    resolved.positionMode === "percent" ? styles.pathPositioned : "",
    flightExiting ? styles.flightExiting : "",
    suppressReveal ? styles.suppressReveal : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <LanternActionsDockProvider>
      {(dockRef) => (
        <article
          className={rootClass}
          style={rootStyle}
          aria-label={ariaLabel}
          {...(generating ? { "data-haiku-generating": true } : {})}
          {...(pathHaikuId ? { "data-path-haiku-id": pathHaikuId } : {})}
        >
          <LanternFrameShell />
          <div className={styles.content}>{children}</div>
          {showLabelBelt ? (
            <LanternFrameBelt
              labels={labels}
              haikuLabels={haikuLabels}
              excludeLabelIds={excludeLabelIds}
            />
          ) : null}
          <div
            ref={dockRef}
            className={styles.actionsBarHost}
            data-lantern-actions-dock=""
          />
        </article>
      )}
    </LanternActionsDockProvider>
  );
}

export type { LanternTransform };
