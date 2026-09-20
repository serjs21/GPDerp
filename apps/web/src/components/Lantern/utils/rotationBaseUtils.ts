import type { CSSProperties } from "react";
import type { LanternRotatedContentTransform } from "../consts/rotationBaseConsts";

export type RotationBaseRootStyleInput = {
  widthRem: number;
  transform: LanternRotatedContentTransform;
  actionsBarOffsetX?: string;
  actionsBarOffsetY?: string;
  style?: CSSProperties;
};

/**
 * Builds CSS custom properties for the rotated lantern shell
 * (content-face box, tilt/skew, optional flame + actions-bar offsets).
 */
export function buildRotationBaseRootStyle({
  widthRem,
  transform,
  actionsBarOffsetX,
  actionsBarOffsetY,
  style,
}: RotationBaseRootStyleInput): CSSProperties {
  return {
    "--lantern-rotated-width": `${widthRem}rem`,
    "--lantern-rotated-aspect": `${transform.imageWidth} / ${transform.imageHeight}`,
    "--lantern-rotated-content-left": `${transform.contentLeftPct}%`,
    "--lantern-rotated-content-top": `${transform.contentTopPct}%`,
    "--lantern-rotated-content-width": `${transform.contentWidthPct}%`,
    "--lantern-rotated-content-height": `${transform.contentHeightPct}%`,
    "--lantern-rotated-content-scale": String(transform.contentScale),
    "--lantern-rotated-tilt": `${transform.rotateDeg}deg`,
    "--lantern-rotated-skew-x": `${transform.skewXDeg}deg`,
    "--lantern-rotated-skew-y": `${transform.skewYDeg}deg`,
    ...(transform.flameBottom != null
      ? { "--lantern-rotated-flame-bottom": String(transform.flameBottom) }
      : {}),
    ...(transform.flameHeight != null
      ? { "--lantern-rotated-flame-height": String(transform.flameHeight) }
      : {}),
    ...(actionsBarOffsetX != null
      ? { "--lantern-actions-bar-offset-x": actionsBarOffsetX }
      : {}),
    ...(actionsBarOffsetY != null
      ? { "--lantern-actions-bar-offset-y": actionsBarOffsetY }
      : {}),
    ...style,
  } as CSSProperties;
}
