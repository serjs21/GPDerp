/**
 * Viewer-space angle (degrees) from the center of `originRect` to the pointer.
 * Matches `Math.atan2(dy, dx)` used by the celestial dial.
 */
export function pointerAngleFromOriginDeg(
  clientX: number,
  clientY: number,
  originRect: DOMRect,
): { angleDeg: number; distance: number } {
  const centerX = originRect.left + originRect.width / 2;
  const centerY = originRect.top + originRect.height / 2;
  const dx = clientX - centerX;
  const dy = clientY - centerY;
  return {
    angleDeg: (Math.atan2(dy, dx) * 180) / Math.PI,
    distance: Math.hypot(dx, dy),
  };
}

/** Shortest signed delta from `fromDeg` to `toDeg` in (−180, 180]. */
export function shortestAngleDeltaDeg(fromDeg: number, toDeg: number): number {
  let delta = toDeg - fromDeg;
  delta = ((((delta + 180) % 360) + 360) % 360) - 180;
  return delta;
}
