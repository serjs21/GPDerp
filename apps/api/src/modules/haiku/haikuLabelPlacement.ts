/** Max labels linked to a single haiku (LabelHalo). */
export const HAIKU_LABELS_MAX = 10;

/**
 * LabelHalo drop area = lantern content + pad (5rem). Percents below assume a
 * typical path lantern (~19rem wide, ~aspect 368/391) so the content box sits
 * roughly in the middle and the pad forms top/side buffers.
 *
 * Initial placement only samples the buffer (top + left + right). The content
 * face and the bottom strip (actions bar) are excluded.
 */
export const LABEL_PLACEMENT_CONTENT = {
  x0: 18,
  x1: 82,
  y0: 17,
  /** Keep clear of haiku actions docked under the lantern. */
  y1: 78,
} as const;

export const LABEL_PLACEMENT_BOUNDS = {
  xMin: 4,
  xMax: 96,
  yMin: 3,
  yMax: 96,
} as const;

/** Legacy belt fill order — kept for connectionPointId back-compat. Prefer top/sides. */
export const HAIKU_LABEL_CONNECTION_FILL_ORDER = [
  "tl",
  "tr",
  "ml",
  "mr",
  "bl",
  "br",
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

/**
 * Percent seeds in the drop-area buffer (sides / top), not over content.
 * Matches apps/web LabelHalo connection-point defaults where possible.
 */
export const HAIKU_LABEL_CONNECTION_XY: Record<
  HaikuLabelConnectionPointId,
  { xPercent: number; yPercent: number }
> = {
  tl: { xPercent: 8, yPercent: 6 },
  tr: { xPercent: 92, yPercent: 6 },
  ml: { xPercent: 6, yPercent: 36 },
  mr: { xPercent: 94, yPercent: 36 },
  bl: { xPercent: 6, yPercent: 68 },
  br: { xPercent: 94, yPercent: 68 },
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

/** True when (x,y) sits in the top/side pad buffer, not over content or actions. */
export function isLabelPlacementInBuffer(x: number, y: number): boolean {
  const { xMin, xMax, yMin, yMax } = LABEL_PLACEMENT_BOUNDS;
  const { x0, x1, y0, y1 } = LABEL_PLACEMENT_CONTENT;
  if (x < xMin || x > xMax || y < yMin || y > yMax) return false;
  // Bottom strip reserved for actions / under-lantern chrome.
  if (y > y1) return false;
  // Top buffer (full width within bounds).
  if (y < y0) return true;
  // Side buffers beside the content face.
  if (x < x0 || x > x1) return true;
  return false;
}

function connectionPointForBuffer(x: number, y: number): HaikuLabelConnectionPointId {
  const { x0, x1, y0 } = LABEL_PLACEMENT_CONTENT;
  if (y < y0) return x < 50 ? "tl" : "tr";
  if (x < x0) return y > 55 ? "bl" : "ml";
  if (x > x1) return y > 55 ? "br" : "mr";
  return x < 50 ? "ml" : "mr";
}

type BufferBand = {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
};

function bufferBands(): BufferBand[] {
  const { xMin, xMax, yMin } = LABEL_PLACEMENT_BOUNDS;
  const { x0, x1, y0, y1 } = LABEL_PLACEMENT_CONTENT;
  return [
    // Top pad across the drop area.
    { x0: xMin, x1: xMax, y0: yMin, y1: y0 },
    // Left pad beside content (stops above actions).
    { x0: xMin, x1: x0, y0: y0, y1: y1 },
    // Right pad beside content.
    { x0: x1, x1: xMax, y0: y0, y1: y1 },
  ];
}

/**
 * Pick a semi-random spot in the lantern drop-area buffer (top + sides),
 * maximizing distance to existing labels (least-occupied).
 */
export function pickLeastOccupiedLabelPlacement(
  existing: Array<{ xPercent: number; yPercent: number }>,
  rng: () => number = Math.random,
): HaikuLabelPlacement {
  const bands = bufferBands();
  const candidates: Array<{ x: number; y: number; score: number }> = [];
  const gridX = 7;
  const gridY = 5;

  for (const band of bands) {
    const width = band.x1 - band.x0;
    const height = band.y1 - band.y0;
    if (width <= 0 || height <= 0) continue;

    for (let ix = 0; ix < gridX; ix += 1) {
      for (let iy = 0; iy < gridY; iy += 1) {
        const jitterX = (rng() - 0.5) * (width / gridX) * 0.85;
        const jitterY = (rng() - 0.5) * (height / gridY) * 0.85;
        const x =
          band.x0 + ((ix + 0.5) / gridX) * width + jitterX;
        const y =
          band.y0 + ((iy + 0.5) / gridY) * height + jitterY;
        if (!isLabelPlacementInBuffer(x, y)) continue;

        let minDist = Number.POSITIVE_INFINITY;
        for (const point of existing) {
          const d = Math.hypot(x - point.xPercent, y - point.yPercent);
          if (d < minDist) minDist = d;
        }
        if (!Number.isFinite(minDist)) minDist = 100;

        // Soft edge penalty so labels sit slightly inward from the outer rim.
        const edgePenalty =
          Math.max(0, LABEL_PLACEMENT_BOUNDS.xMin + 4 - x) +
          Math.max(0, x - (LABEL_PLACEMENT_BOUNDS.xMax - 4)) +
          Math.max(0, LABEL_PLACEMENT_BOUNDS.yMin + 3 - y);
        candidates.push({ x, y, score: minDist - edgePenalty * 0.4 });
      }
    }
  }

  if (candidates.length === 0) {
    return defaultPlacementForIndex(existing.length);
  }

  candidates.sort((a, b) => b.score - a.score);
  const topK = candidates.slice(0, Math.min(8, candidates.length));
  const pick = topK[Math.floor(rng() * topK.length)] ?? topK[0]!;
  const xPercent = roundPlacement(clampPercent(pick.x));
  const yPercent = roundPlacement(clampPercent(pick.y));
  const rotateDeg = roundPlacement(rng() * 40 - 20);
  const connectionPointId = connectionPointForBuffer(xPercent, yPercent);

  return {
    connectionPointId,
    rotateDeg,
    xPercent,
    yPercent,
  };
}
