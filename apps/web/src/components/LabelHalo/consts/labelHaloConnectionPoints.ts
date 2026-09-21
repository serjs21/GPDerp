import type { CSSProperties } from "react";

/** start = left-center anchor; end = right-center anchor. */
export type LabelHaloAnchor = "start" | "end";

export type LabelHaloConnectionPointId = "bl" | "ml" | "tl" | "tr" | "mr" | "br";

/**
 * Halo connection point: `top` plus exactly one of `left` | `right` (percent of halo).
 * `connection` chooses which label edge sits on the point and the rotate axis.
 */
export type LabelHaloConnectionPoint = {
  id: LabelHaloConnectionPointId;
  top: number;
  left?: number;
  right?: number;
  connection: LabelHaloAnchor;
  defaultRotateDeg: number;
};

/**
 * Default six lantern-relative anchors.
 * Left column hangs from label end (right edge); right column from start (left edge).
 */
export const DEFAULT_LABEL_HALO_CONNECTION_POINTS: LabelHaloConnectionPoint[] = [
  { id: "bl", top: 60, left: 0, connection: "end", defaultRotateDeg: -22 },
  { id: "ml", top: 32, left: -5, connection: "end", defaultRotateDeg: 0 },
  { id: "tl", top: 0, left: 0, connection: "end", defaultRotateDeg: 22 },
  { id: "tr", top: -5, right: 0, connection: "start", defaultRotateDeg: -22 },
  { id: "mr", top: 28, right: -5, connection: "start", defaultRotateDeg: 0 },
  { id: "br", top: 62, right: 0, connection: "start", defaultRotateDeg: 22 },
];

/** Marker / droppable position at the configured percentages. */
export function connectionPointInsetStyle(
  point: Pick<LabelHaloConnectionPoint, "top" | "left" | "right">,
): CSSProperties {
  return {
    top: `${point.top}%`,
    ...(point.left != null ? { left: `${point.left}%` } : null),
    ...(point.right != null ? { right: `${point.right}%` } : null),
  };
}

/**
 * Pin the slot so its connection edge sits on the point:
 * - start → left edge at point
 * - end → right edge at point
 */
export function slotPositionStyle(point: LabelHaloConnectionPoint): CSSProperties {
  const top = `${point.top}%`;
  if (point.connection === "start") {
    const left =
      point.left != null
        ? `${point.left}%`
        : `calc(100% - ${point.right ?? 0}%)`;
    return { top, left };
  }
  const right =
    point.right != null
      ? `${point.right}%`
      : `calc(100% - ${point.left ?? 0}%)`;
  return { top, right };
}

export function transformOriginForConnection(connection: LabelHaloAnchor): string {
  return connection === "start" ? "left center" : "right center";
}
