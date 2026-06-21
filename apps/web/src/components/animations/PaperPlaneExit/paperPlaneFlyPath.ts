export type FlyPath = {
  endX: number;
  endY: number;
  midX: number;
  midY: number;
  endScale: number;
  rotateDelta: number;
};

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedFromRect(rect: DOMRect): number {
  const left = Math.round(rect.left * 10);
  const top = Math.round(rect.top * 10);
  const width = Math.round(rect.width * 10);
  return (left * 73856093) ^ (top * 19349663) ^ (width * 83492791);
}

/** Up-right arc with per-card jitter; stable for the same viewport position. */
export function createFlyPath(seed: number): FlyPath {
  const rng = mulberry32(seed);

  const baseAngle = -0.72 + (rng() - 0.5) * 0.3;
  const distance = 220 + rng() * 80;
  const endX = Math.cos(baseAngle) * distance;
  const endY = Math.sin(baseAngle) * distance;

  const midBiasX = 0.32 + rng() * 0.18;
  const midBiasY = 0.22 + rng() * 0.14;
  const midSwayX = (rng() - 0.5) * 40;
  const midSwayY = (rng() - 0.5) * 28;

  return {
    endX,
    endY,
    midX: endX * midBiasX + midSwayX,
    midY: endY * midBiasY + midSwayY,
    endScale: 0.06 + rng() * 0.04,
    rotateDelta: 8 + rng() * 10,
  };
}

export function quadBezier(p0: number, p1: number, p2: number, t: number): number {
  const inv = 1 - t;
  return inv * inv * p0 + 2 * inv * t * p1 + t * t * p2;
}

export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function flyOpacityAt(t: number): number {
  if (t <= 0.7) return 1;
  return 1 - (t - 0.7) / 0.3;
}
