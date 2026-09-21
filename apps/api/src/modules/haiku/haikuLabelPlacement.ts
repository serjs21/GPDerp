/** Max labels linked to a single haiku (LabelHalo). */
export const HAIKU_LABELS_MAX = 10;

/** Legacy belt fill order — kept for connectionPointId back-compat. */
export const HAIKU_LABEL_CONNECTION_FILL_ORDER = [
  "bl",
  "br",
  "mr",
  "tr",
  "tl",
  "ml",
] as const;

export type HaikuLabelConnectionPointId =
  (typeof HAIKU_LABEL_CONNECTION_FILL_ORDER)[number];

/** Default rotateDeg for each connection point (matches lantern belt stops). */
export const HAIKU_LABEL_DEFAULT_ROTATE_DEG: Record<
  HaikuLabelConnectionPointId,
  number
> = {
  bl: -22,
  br: 22,
  mr: 0,
  tr: -22,
  tl: 22,
  ml: 0,
};

/** Percent seeds matching apps/web LabelHalo connection-point defaults. */
export const HAIKU_LABEL_CONNECTION_XY: Record<
  HaikuLabelConnectionPointId,
  { xPercent: number; yPercent: number }
> = {
  bl: { xPercent: 0, yPercent: 60 },
  ml: { xPercent: 0, yPercent: 32 },
  tl: { xPercent: 0, yPercent: 0 },
  tr: { xPercent: 100, yPercent: 0 },
  mr: { xPercent: 100, yPercent: 28 },
  br: { xPercent: 100, yPercent: 62 },
};

export type HaikuLinkedLabel = {
  id: string;
  name: string;
  color: string;
  shape: string;
  connectionPointId: string;
  rotateDeg: number;
  xPercent: number;
  yPercent: number;
};

export type HaikuLabelPlacement = {
  connectionPointId: string;
  rotateDeg: number;
  xPercent: number;
  yPercent: number;
};

export const haikuLabelLinkSelect = {
  connectionPointId: true,
  rotateDeg: true,
  xPercent: true,
  yPercent: true,
  label: {
    select: {
      id: true,
      name: true,
      color: true,
      shape: true,
    },
  },
} as const;

export function mapHaikuLabelLinks(
  rows: Array<{
    connectionPointId: string;
    rotateDeg: number;
    xPercent: number;
    yPercent: number;
    label: { id: string; name: string; color: string; shape: string };
  }>,
): HaikuLinkedLabel[] {
  return rows.map((row) => ({
    id: row.label.id,
    name: row.label.name,
    color: row.label.color,
    shape: row.label.shape,
    connectionPointId: row.connectionPointId,
    rotateDeg: row.rotateDeg,
    xPercent: row.xPercent,
    yPercent: row.yPercent,
  }));
}

export function defaultPlacementForIndex(index: number): HaikuLabelPlacement {
  const connectionPointId =
    HAIKU_LABEL_CONNECTION_FILL_ORDER[
      index % HAIKU_LABEL_CONNECTION_FILL_ORDER.length
    ]!;
  const xy = HAIKU_LABEL_CONNECTION_XY[connectionPointId];
  return {
    connectionPointId,
    rotateDeg: HAIKU_LABEL_DEFAULT_ROTATE_DEG[connectionPointId],
    xPercent: xy.xPercent,
    yPercent: xy.yPercent,
  };
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 50;
  return Math.min(100, Math.max(0, value));
}

function roundPlacement(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Pick a semi-random spot in an annulus around the lantern center,
 * maximizing distance to existing labels (least-occupied).
 */
export function pickLeastOccupiedLabelPlacement(
  existing: Array<{ xPercent: number; yPercent: number }>,
  rng: () => number = Math.random,
): HaikuLabelPlacement {
  const CX = 50;
  const CY = 48;
  const rings = [26, 32, 38, 44];
  const angleSteps = 18;
  const candidates: Array<{ x: number; y: number; score: number }> = [];

  for (const radius of rings) {
    for (let i = 0; i < angleSteps; i += 1) {
      const angle = (i / angleSteps) * Math.PI * 2 + rng() * 0.2;
      const x = CX + Math.cos(angle) * radius;
      const y = CY + Math.sin(angle) * radius * 0.92;
      if (x < 6 || x > 94 || y < 4 || y > 96) continue;

      let minDist = Number.POSITIVE_INFINITY;
      for (const point of existing) {
        const d = Math.hypot(x - point.xPercent, y - point.yPercent);
        if (d < minDist) minDist = d;
      }
      if (!Number.isFinite(minDist)) minDist = 100;

      // Prefer mid-band; slight edge penalty.
      const edgePenalty =
        Math.max(0, 8 - x) +
        Math.max(0, x - 92) +
        Math.max(0, 6 - y) +
        Math.max(0, y - 94);
      candidates.push({ x, y, score: minDist - edgePenalty * 0.35 });
    }
  }

  if (candidates.length === 0) {
    return defaultPlacementForIndex(existing.length);
  }

  candidates.sort((a, b) => b.score - a.score);
  const topK = candidates.slice(0, Math.min(5, candidates.length));
  const pick = topK[Math.floor(rng() * topK.length)] ?? topK[0]!;
  const xPercent = roundPlacement(clampPercent(pick.x));
  const yPercent = roundPlacement(clampPercent(pick.y));
  const rotateDeg = roundPlacement(rng() * 40 - 20);
  const connectionPointId = xPercent < 50 ? "ml" : "mr";

  return {
    connectionPointId,
    rotateDeg,
    xPercent,
    yPercent,
  };
}
