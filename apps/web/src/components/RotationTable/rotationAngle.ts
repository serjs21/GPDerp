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
  return pointerAngleFromPointDeg(clientX, clientY, centerX, centerY);
}

/** Viewer-space angle from a fixed client-space pivot to the pointer. */
export function pointerAngleFromPointDeg(
  clientX: number,
  clientY: number,
  originX: number,
  originY: number,
): { angleDeg: number; distance: number } {
  const dx = clientX - originX;
  const dy = clientY - originY;
  return {
    angleDeg: (Math.atan2(dy, dx) * 180) / Math.PI,
    distance: Math.hypot(dx, dy),
  };
}

/**
 * Screen position of the element's CSS transform-origin.
 * Temporarily clears transform so ox/oy map onto the untransformed border box —
 * call only synchronously (e.g. pointerdown) and restore before paint.
 */
export function measureTransformOriginClient(el: HTMLElement): {
  x: number;
  y: number;
} {
  const style = getComputedStyle(el);
  const parts = style.transformOrigin.split(" ");
  const ox = parseFloat(parts[0] ?? "0");
  const oy = parseFloat(parts[1] ?? "0");
  const prevInline = el.style.transform;
  el.style.transform = "none";
  const rect = el.getBoundingClientRect();
  el.style.transform = prevInline;
  return { x: rect.left + ox, y: rect.top + oy };
}

/** Shortest signed delta from `fromDeg` to `toDeg` in (−180, 180]. */
export function shortestAngleDeltaDeg(fromDeg: number, toDeg: number): number {
  let delta = toDeg - fromDeg;
  delta = ((((delta + 180) % 360) + 360) % 360) - 180;
  return delta;
}
