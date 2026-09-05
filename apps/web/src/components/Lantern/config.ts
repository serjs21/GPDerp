/**
 * Hard-coded LabelBelt stop map: lantern-relative % anchors + rotation.
 *
 * Left stops pin the container’s **center-right** (text end).
 * Right stops pin the container’s **center-left** (text start).
 * Exactly one of `top`/`bottom` and one of `left`/`right` per stop.
 */

export type LabelBeltStopId = "bl" | "ml" | "tl" | "tr" | "mr" | "br";

export type LabelBeltStopSide = "left" | "right";

export type LabelBeltStop = {
  id: LabelBeltStopId;
  side: LabelBeltStopSide;
  /** Vertical inset % of lantern overlay — exactly one of top | bottom */
  top?: number;
  bottom?: number;
  /** Horizontal inset % of lantern overlay — exactly one of left | right */
  left?: number;
  right?: number;
  /** Container rotation in degrees */
  rotateDeg: number;
};

export const LABEL_BELT_STOPS: Record<LabelBeltStopId, LabelBeltStop> = {
  bl: { id: "bl", side: "left", left: -30, top: 60, rotateDeg: -22 },
  ml: { id: "ml", side: "left", left: -35, top: 32, rotateDeg: 0 },
  tl: { id: "tl", side: "left", left: -34, top: 0, rotateDeg: 22 },
  tr: { id: "tr", side: "right", right: -28, top: -5, rotateDeg: -22 },
  mr: { id: "mr", side: "right", right: -38, top: 28, rotateDeg: 0 },
  br: { id: "br", side: "right", right: -32, top: 62, rotateDeg: 22 },
};

/** CSS transform-origin for a stop’s lantern-facing text edge. */
export function labelBeltStopTransformOrigin(side: LabelBeltStopSide): string {
  return side === "left" ? "right center" : "left center";
}

/** Absolute inset style bits from a stop (percentage strings). */
export function labelBeltStopInsetStyle(stop: LabelBeltStop): {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
} {
  return {
    ...(stop.top != null ? { top: `${stop.top}%` } : null),
    ...(stop.bottom != null ? { bottom: `${stop.bottom}%` } : null),
    ...(stop.left != null ? { left: `${stop.left}%` } : null),
    ...(stop.right != null ? { right: `${stop.right}%` } : null),
  };
}

/** Anchor point in overlay pixels for FLIP flyers. */
export function labelBeltStopAnchorPx(
  stop: LabelBeltStop,
  overlayW: number,
  overlayH: number,
): { x: number; y: number } {
  const x =
    stop.left != null
      ? (overlayW * stop.left) / 100
      : overlayW * (1 - (stop.right ?? 0) / 100);
  const y =
    stop.top != null
      ? (overlayH * stop.top) / 100
      : overlayH * (1 - (stop.bottom ?? 0) / 100);
  return { x, y };
}
