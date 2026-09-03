/** Max labels drawn on the upper-half belt at once; extras rotate via nav arrows. */
export const LABEL_BELT_MAX_VISIBLE = 9;

/** Gap from the lantern box edge to each label center along the radius. */
export const LABEL_BELT_EDGE_GAP = "1rem";

export type LabelBeltSlot = {
  index: number;
  /** Outward angle in radians (0 = east, π/2 = south). */
  angleRad: number;
  /** Unit vector X (cos) for CSS calc positioning from the box center. */
  cos: number;
  /** Unit vector Y (sin) for CSS calc positioning from the box center. */
  sin: number;
  /**
   * CSS rotate degrees so the label's horizontal axis lies on the radius
   * (text sits along the ray from the lantern center, reading outward).
   */
  rotateDeg: number;
};

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

/**
 * Rotate so local +X (text LTR) points along the radius.
 * Left half (+180°) flips text so it reads downward instead of upside-down.
 * Top → −90°; right → 0°; left → 0° after flip (from −180°).
 */
export function labelBeltRotateDeg(angleRad: number): number {
  const deg = (angleRad * 180) / Math.PI;
  // Left of top (cos < 0): flip so glyphs point down / stay readable.
  if (angleRad < -Math.PI / 2) {
    return deg + 180;
  }
  return deg;
}

export function buildLabelBeltSlots(count: number): LabelBeltSlot[] {
  if (count <= 0) return [];
  const slots: LabelBeltSlot[] = [];
  for (let index = 0; index < count; index += 1) {
    const angleRad = labelBeltAngleForIndex(index, count);
    slots.push({
      index,
      angleRad,
      cos: Math.cos(angleRad),
      sin: Math.sin(angleRad),
      rotateDeg: labelBeltRotateDeg(angleRad),
    });
  }
  return slots;
}
