/** Max labels drawn on the upper-half belt at once; extras rotate via nav arrows. */
export const LABEL_BELT_MAX_VISIBLE = 9;

/**
 * Extra clearance beyond half the label *content* box (spike margin).
 * Centers sit on the host edge + contentHalf + this gap along the rect normal.
 */
export const LABEL_BELT_SPIKE_GAP = "0.75rem";

export type LabelBeltSlot = {
  index: number;
  /** Outward angle in radians (0 = east, π/2 = south). */
  angleRad: number;
  /**
   * Rectangular edge offset X in [-1, 1]: ray from center mapped onto the
   * host box perimeter (axis-aligned), not a circle.
   */
  rectX: number;
  /**
   * Rectangular edge offset Y in [-1, 1] (same mapping as `rectX`).
   */
  rectY: number;
  /**
   * CSS rotate degrees. Belt labels stay upright (0) so text matches the
   * burst the same way as standalone ComicBurstLabel — radial spins made
   * glyphs look detached from the silhouette.
   */
  rotateDeg: number;
};

/**
 * Map a unit ray (cos, sin) onto an axis-aligned rectangle perimeter.
 * Corners land at (±1, ±1) so labels clear the box instead of a circle chord.
 */
export function labelBeltRectOffset(angleRad: number): { rectX: number; rectY: number } {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const m = Math.max(Math.abs(cos), Math.abs(sin));
  if (m < Number.EPSILON) {
    return { rectX: 0, rectY: -1 };
  }
  return { rectX: cos / m, rectY: sin / m };
}

/**
 * Upper-half arc angle for slot `index` of `count`.
 * Spreads evenly from left (−π) through top (−π/2) to right (0).
 * Single label → top center (−π/2).
 */
export function labelBeltAngleForIndex(index: number, count: number): number {
  if (count <= 0) return -Math.PI / 2;
  if (count === 1) return -Math.PI / 2;
  return -Math.PI + (index * Math.PI) / (count - 1);
}

/** Belt labels stay upright so text stays centered in the burst. */
export function labelBeltRotateDeg(_angleRad: number): number {
  return 0;
}

export function buildLabelBeltSlots(count: number): LabelBeltSlot[] {
  if (count <= 0) return [];
  const slots: LabelBeltSlot[] = [];
  for (let index = 0; index < count; index += 1) {
    const angleRad = labelBeltAngleForIndex(index, count);
    const { rectX, rectY } = labelBeltRectOffset(angleRad);
    slots.push({
      index,
      angleRad,
      rectX,
      rectY,
      rotateDeg: labelBeltRotateDeg(angleRad),
    });
  }
  return slots;
}
