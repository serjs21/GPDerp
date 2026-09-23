import type { CSSProperties } from "react";
import type { LanternRotatedContentTransform } from "../consts/rotationBaseConsts";

export type RotationBaseRootStyleInput = {
  widthRem: number;
  transform: LanternRotatedContentTransform;
  /** When true, face plane uses mirrored left + negated rotate/skew (base mirrors separately). */
  mirrored?: boolean;
  actionsBarOffsetX?: string;
  actionsBarOffsetY?: string;
  style?: CSSProperties;
};

/**
 * Face-plane values when the base PNG is flipped with scaleX(-1).
 * Content stays readable: reverse left anchor and negate tilt/skew (no scaleX on text).
 */
export function mirroredFacePlane(transform: LanternRotatedContentTransform): {
  contentLeftPct: number;
  rotateDeg: number;
  skewXDeg: number;
  skewYDeg: number;
} {
  return {
    contentLeftPct: 100 - transform.contentLeftPct,
    rotateDeg: -transform.rotateDeg,
    skewXDeg: -transform.skewXDeg,
    skewYDeg: -transform.skewYDeg,
  };
}

/**
 * Builds CSS custom properties for the rotated lantern shell
 * (content-face box, tilt/skew, optional flame + actions-bar offsets).
 */
export function buildRotationBaseRootStyle({
  widthRem,
  transform,
  mirrored = false,
  actionsBarOffsetX,
  actionsBarOffsetY,
  style,
}: RotationBaseRootStyleInput): CSSProperties {
  const face = mirrored ? mirroredFacePlane(transform) : transform;

  return {
    "--lantern-rotated-width": `${widthRem}rem`,
    "--lantern-rotated-aspect": `${transform.imageWidth} / ${transform.imageHeight}`,
    "--lantern-rotated-content-left": `${face.contentLeftPct}%`,
    "--lantern-rotated-content-top": `${transform.contentTopPct}%`,
    "--lantern-rotated-content-width": `${transform.contentWidthPct}%`,
    "--lantern-rotated-content-height": `${transform.contentHeightPct}%`,
    "--lantern-rotated-content-scale": String(transform.contentScale),
    "--lantern-rotated-tilt": `${face.rotateDeg}deg`,
    "--lantern-rotated-skew-x": `${face.skewXDeg}deg`,
    "--lantern-rotated-skew-y": `${face.skewYDeg}deg`,
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
