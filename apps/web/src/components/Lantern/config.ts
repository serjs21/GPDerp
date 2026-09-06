/**
 * Hard-coded LabelBelt stop map: lantern-relative % anchors + rotation.
 *
 * Left stops pin the container’s **right** edge (lantern-facing / text end).
 * Right stops pin the container’s **left** edge (lantern-facing / text start).
 * Labels grow away from the lantern as text lengthens, so min/max lengths
 * share the same lantern-facing border.
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

/**
 * Convert a former outer-edge % (negative = outside) into the CSS inset that
 * pins the lantern-facing edge at that same coordinate.
 * left: -30 → right: 130% (right edge at -30% from overlay left).
 */
function facingInsetFromOuter(outerPct: number): number {
  return 100 - outerPct;
}

export const LABEL_BELT_STOPS: Record<LabelBeltStopId, LabelBeltStop> = {
  // Left column: pin RIGHT edge (was left: -30/-35/-34)
  bl: { id: "bl", side: "left", right: facingInsetFromOuter(0), top: 60, rotateDeg: -22 },
  ml: { id: "ml", side: "left", right: facingInsetFromOuter(0), top: 32, rotateDeg: 0 },
  tl: { id: "tl", side: "left", right: facingInsetFromOuter(0), top: 0, rotateDeg: 22 },
  // Right column: pin LEFT edge (was right: -28/-38/-32)
  tr: { id: "tr", side: "right", left: facingInsetFromOuter(-10), top: -5, rotateDeg: -22 },
  mr: { id: "mr", side: "right", left: facingInsetFromOuter(-10), top: 28, rotateDeg: 0 },
  br: { id: "br", side: "right", left: facingInsetFromOuter(-10), top: 62, rotateDeg: 22 },
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

/** Anchor point in overlay pixels for the lantern-facing edge. */
export function labelBeltStopAnchorPx(
  stop: LabelBeltStop,
  overlayW: number,
  overlayH: number,
): { x: number; y: number } {
  const x =
    stop.side === "left"
      ? overlayW * (1 - (stop.right ?? 0) / 100)
      : (overlayW * (stop.left ?? 0)) / 100;
  const y =
    stop.top != null
      ? (overlayH * stop.top) / 100
      : overlayH * (1 - (stop.bottom ?? 0) / 100);
  return { x, y };
}
