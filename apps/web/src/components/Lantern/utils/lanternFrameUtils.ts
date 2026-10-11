import type { CSSProperties } from "react";
import {
  LANTERN_FLAME_ANCHOR_Y,
  LANTERN_FLAME_BOTTOM,
  LANTERN_FLAME_HEIGHT,
  LANTERN_WIDTH_REM,
} from "../constants";
import { toLabelBeltItems, type LabelBeltItem } from "../LabelBelt";
import styles from "../Lantern.module.css";
import { lanternTransformToCssVars, type LanternTransform } from "../lanternTransform";
import type { LanternFrameLabelSource } from "../LanternFrame";

export function lanternFrameRootStyle(params: {
  resolved: LanternTransform;
  widthRem: number | undefined;
  actionsBarOffsetX: string | undefined;
  actionsBarOffsetY: string | undefined;
  style: CSSProperties | undefined;
}): CSSProperties {
  const { resolved, widthRem = LANTERN_WIDTH_REM, actionsBarOffsetX, actionsBarOffsetY, style } = params;
  return {
    ...lanternTransformToCssVars(resolved),
    "--lantern-width": `${widthRem}rem`,
    "--lantern-flame-bottom": String(LANTERN_FLAME_BOTTOM),
    "--lantern-flame-height": String(LANTERN_FLAME_HEIGHT),
    "--lantern-flame-anchor-y": String(LANTERN_FLAME_ANCHOR_Y),
    ...(actionsBarOffsetX != null ? { "--lantern-actions-bar-offset-x": actionsBarOffsetX } : {}),
    ...(actionsBarOffsetY != null ? { "--lantern-actions-bar-offset-y": actionsBarOffsetY } : {}),
    ...style,
  } as CSSProperties;
}

export function lanternFrameRootClassName(params: {
  resolved: LanternTransform;
  flightExiting: boolean | undefined;
  suppressReveal: boolean | undefined;
  className: string | undefined;
}): string {
  const { resolved, flightExiting, suppressReveal, className } = params;
  return [
    styles.root,
    resolved.positionMode === "percent" ? styles.pathPositioned : "",
    flightExiting ? styles.flightExiting : "",
    suppressReveal ? styles.suppressReveal : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Generating marker + path-handoff measurement id, only present when set. */
export function lanternFrameDataAttributes(generating: boolean | undefined, pathHaikuId: string | undefined) {
  return {
    ...(generating ? { "data-haiku-generating": true } : {}),
    ...(pathHaikuId ? { "data-path-haiku-id": pathHaikuId } : {}),
  };
}

/** Prebuilt belt items win; otherwise convert raw haiku labels; null when there is nothing to show. */
export function resolveLanternBeltItems(
  labels: LabelBeltItem[] | undefined,
  haikuLabels: ReadonlyArray<LanternFrameLabelSource> | undefined,
  excludeLabelIds: string[] | undefined,
): LabelBeltItem[] | null {
  if (labels?.length) return labels;
  if (!haikuLabels?.length) return null;
  const items = toLabelBeltItems(haikuLabels, excludeLabelIds);
  return items.length > 0 ? items : null;
}
