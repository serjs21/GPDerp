import {
  LABEL_BELT_STOPS,
  type LabelBeltStop,
  type LabelBeltStopId,
  type LabelBeltStopSide,
} from "./config";

export type { LabelBeltStop, LabelBeltStopId, LabelBeltStopSide };

/** Max labels drawn at once; extras rotate via nav arrows. */
export const LABEL_BELT_MAX_VISIBLE = 6;

export type LabelBeltSlotId = LabelBeltStopId;

export type LabelBeltPortalAxis = "x" | "y";

export type LabelBeltSlot = {
  id: LabelBeltSlotId;
  index: number;
  side: LabelBeltStopSide;
  /** CSS rotate degrees from the stop config. */
  rotateDeg: number;
  /** Full stop record (lantern-relative % insets). */
  stop: LabelBeltStop;
};

/**
 * Fill priority when fewer than 6 labels: clockwise from bottom-left.
 * bl → br → mr → tr → tl → ml
 */
export const LABEL_BELT_FILL_ORDER: readonly LabelBeltSlotId[] = [
  "bl",
  "br",
  "mr",
  "tr",
  "tl",
  "ml",
] as const;

/**
 * Ring order for overflow window + portal neighbors (clockwise from bl):
 * bl → br → mr → tr → tl → ml → bl
 *
 * With this order, nav prev (delta −1) advances labels clockwise and
 * nav next (delta +1) advances them counter-clockwise. Portal travel
 * signs stay tied to delta (animation direction unchanged).
 */
export const LABEL_BELT_RING_ORDER: readonly LabelBeltSlotId[] = [
  "bl",
  "br",
  "mr",
  "tr",
  "tl",
  "ml",
] as const;

function slotFromId(id: LabelBeltSlotId, index: number): LabelBeltSlot {
  const stop = LABEL_BELT_STOPS[id];
  return {
    id,
    index,
    side: stop.side,
    rotateDeg: stop.rotateDeg,
    stop,
  };
}

/**
 * Build slots for `count` visible labels.
 * - `count < 6`: occupy fill-order slots (clockwise from bottom-left).
 * - `count === 6`: all slots in ring order (overflow window maps index → ring).
 */
export function buildLabelBeltSlots(count: number): LabelBeltSlot[] {
  if (count <= 0) return [];
  const n = Math.min(count, LABEL_BELT_MAX_VISIBLE);
  if (n === LABEL_BELT_MAX_VISIBLE) {
    return LABEL_BELT_RING_ORDER.map((id, index) => slotFromId(id, index));
  }
  return LABEL_BELT_FILL_ORDER.slice(0, n).map((id, index) => slotFromId(id, index));
}

/** Ring neighbor in the given direction (−1 = prev, +1 = next). */
export function labelBeltRingNeighbor(
  id: LabelBeltSlotId,
  direction: 1 | -1,
): LabelBeltSlotId {
  const i = LABEL_BELT_RING_ORDER.indexOf(id);
  const next = (i + direction + LABEL_BELT_RING_ORDER.length) % LABEL_BELT_RING_ORDER.length;
  return LABEL_BELT_RING_ORDER[next]!;
}

/**
 * Portal wipe axis in the slot’s local (rotated) frame.
 * Always `y` so the scroll is perpendicular to the text baseline (local `x`).
 */
export function labelBeltPortalAxisForMove(
  _from: LabelBeltSlotId,
  _to: LabelBeltSlotId,
): LabelBeltPortalAxis {
  return "y";
}

/**
 * Local-Y travel sign for a portal wipe into `to`.
 * Same-side slots share one direction per nav arrow (independent of ring order):
 * - prev (delta −1 / clockwise): left rolls down (+1), right rolls up (−1)
 * - next (delta +1 / counter-clockwise): left rolls up (−1), right rolls down (+1)
 */
export function labelBeltPortalTravelSign(
  to: LabelBeltSlotId,
  delta: 1 | -1,
): 1 | -1 {
  const side = LABEL_BELT_STOPS[to].side;
  return (side === "left" ? -delta : delta) as 1 | -1;
}
