/** Max labels drawn at once; extras rotate via nav arrows. */
export const LABEL_BELT_MAX_VISIBLE = 6;

/**
 * Extra clearance beyond half the label *content* box (spike margin).
 * Centers sit on the host edge + contentHalf + this gap along the rect normal.
 */
export const LABEL_BELT_SPIKE_GAP = "0.75rem";

export type LabelBeltSlotId = "bl" | "ml" | "tl" | "tr" | "mr" | "br";

export type LabelBeltPortalAxis = "x" | "y";

export type LabelBeltSlot = {
  id: LabelBeltSlotId;
  index: number;
  /**
   * Rectangular edge offset X in [-1, 1]: left (−1) or right (+1) column.
   */
  rectX: number;
  /**
   * Rectangular edge offset Y in [-1, 1]: top / mid / bottom along the column.
   */
  rectY: number;
  /** CSS rotate degrees (sketch tilts away from lantern center). */
  rotateDeg: number;
  /** Local portal wipe axis for anime.js scroll (column = y, top link = x). */
  portalAxis: LabelBeltPortalAxis;
};

/**
 * Fill priority when fewer than 6 labels: corners first, then mid spots.
 * Order: bottom-left → top-left → bottom-right → top-right → middle-left → middle-right.
 */
export const LABEL_BELT_FILL_ORDER: readonly LabelBeltSlotId[] = [
  "bl",
  "tl",
  "br",
  "tr",
  "ml",
  "mr",
] as const;

/**
 * Ring order for overflow window + portal neighbors:
 * bl → ml → tl → tr → mr → br → bl
 */
export const LABEL_BELT_RING_ORDER: readonly LabelBeltSlotId[] = [
  "bl",
  "ml",
  "tl",
  "tr",
  "mr",
  "br",
] as const;

const SLOT_DEFS: Record<LabelBeltSlotId, Omit<LabelBeltSlot, "index">> = {
  bl: { id: "bl", rectX: -1, rectY: 0.85, rotateDeg: -22, portalAxis: "y" },
  ml: { id: "ml", rectX: -1, rectY: 0, rotateDeg: 0, portalAxis: "y" },
  tl: { id: "tl", rectX: -1, rectY: -0.85, rotateDeg: 22, portalAxis: "y" },
  tr: { id: "tr", rectX: 1, rectY: -0.85, rotateDeg: -22, portalAxis: "y" },
  mr: { id: "mr", rectX: 1, rectY: 0, rotateDeg: 0, portalAxis: "y" },
  br: { id: "br", rectX: 1, rectY: 0.85, rotateDeg: 22, portalAxis: "y" },
};

function slotFromId(id: LabelBeltSlotId, index: number): LabelBeltSlot {
  return { ...SLOT_DEFS[id], index };
}

/**
 * Build slots for `count` visible labels.
 * - `count < 6`: occupy fill-order slots (corners first).
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
 * Same-side slots share one direction per nav arrow:
 * - prev (delta −1): left rolls down (+1), right rolls up (−1)
 * - next (delta +1): left rolls up (−1), right rolls down (+1)
 */
export function labelBeltPortalTravelSign(
  to: LabelBeltSlotId,
  delta: 1 | -1,
): 1 | -1 {
  const side = SLOT_DEFS[to].rectX;
  return (side < 0 ? -delta : delta) as 1 | -1;
}
