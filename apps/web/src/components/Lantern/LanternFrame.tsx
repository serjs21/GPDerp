"use client";

import type { CSSProperties, ReactNode } from "react";
import type { LabelBeltItem } from "./LabelBelt";
import { LanternActionsDockProvider } from "./LanternActionsDockContext";
import { LanternFrameBelt } from "./LanternFrameBelt";
import { LanternFrameShell } from "./LanternFrameShell";
import {
  resolveLanternTransform,
  type LanternTransform,
  type LanternTransformInput,
} from "./lanternTransform";
import styles from "./Lantern.module.css";
import {
  lanternFrameDataAttributes,
  lanternFrameRootClassName,
  lanternFrameRootStyle,
} from "./utils/lanternFrameUtils";

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

export function LanternFrame({
  className,
  style,
  ariaLabel,
  widthRem,
  generating,
  flightExiting,
  suppressReveal,
  actionsBarOffsetX,
  actionsBarOffsetY,
  labels,
  haikuLabels,
  excludeLabelIds,
  showLabelBelt,
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

  return (
    <LanternActionsDockProvider>
      {(dockRef) => (
        <article
          className={lanternFrameRootClassName({ resolved, flightExiting, suppressReveal, className })}
          style={lanternFrameRootStyle({ resolved, widthRem, actionsBarOffsetX, actionsBarOffsetY, style })}
          aria-label={ariaLabel}
          {...lanternFrameDataAttributes(generating, pathHaikuId)}
        >
          <LanternFrameShell />
          <div className={styles.content}>{children}</div>
          {showLabelBelt === false ? null : (
            <LanternFrameBelt
              labels={labels}
              haikuLabels={haikuLabels}
              excludeLabelIds={excludeLabelIds}
            />
          )}
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
