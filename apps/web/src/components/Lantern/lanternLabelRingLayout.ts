import type { ComicSourceDirection } from "@/components/ComicConfirmModal/comicSourceDirection";

/** Max labels drawn on the ring at once; extras rotate via nav arrows. */
export const LANTERN_LABEL_RING_MAX = 6;

/**
 * Ring radius as a fraction of stage width/height from center (0.5 = edge).
 * Keep ≤ ~0.42 so label boxes stay inside 0–100% (Comical canvas clips outside).
 */
export const LANTERN_LABEL_RING_RADIUS = 0.4;

/** Start angle: top of the lantern (radians, 0 = east, CCW). */
export const LANTERN_LABEL_RING_START_ANGLE = -Math.PI / 2;

const DIRECTIONS: ComicSourceDirection[] = [
  "right",
  "bottom-right",
  "bottom",
  "bottom-left",
  "left",
  "top-left",
  "top",
  "top-right",
];

/**
 * Map outward angle (label relative to lantern center, screen coords:
 * 0 = east, π/2 = south) to a sourceDirection whose tail points back
 * toward the lantern (inward).
 */
export function sourceDirectionFromOutwardAngle(angleRad: number): ComicSourceDirection {
  const tipAngle = angleRad + Math.PI;
  const normalized = ((tipAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const sector = Math.round(normalized / (Math.PI / 4)) % 8;
  return DIRECTIONS[sector] ?? "left";
}

export function ringAngleForIndex(index: number, count: number): number {
  if (count <= 0) return LANTERN_LABEL_RING_START_ANGLE;
  return LANTERN_LABEL_RING_START_ANGLE + (index * 2 * Math.PI) / count;
}

export function rotateLabelsWindow<T>(items: T[], offset: number, maxVisible: number): T[] {
  if (items.length === 0) return [];
  if (items.length <= maxVisible) return items;
  const start = ((offset % items.length) + items.length) % items.length;
  const window: T[] = [];
  for (let i = 0; i < maxVisible; i += 1) {
    window.push(items[(start + i) % items.length]!);
  }
  return window;
}
