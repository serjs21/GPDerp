import { COMIC_BURST_LONG_TEXT_THRESHOLD } from "./measureComicBurstText";
import { createBurstRng } from "./comicBurstSeed";

export type ComicBurstShapeKind = "burst" | "circle" | "square" | "rect" | "thought";

export type ComicBurstPathOptions = {
  width: number;
  height: number;
  spikeCount?: number;
  randomness?: number;
  kind?: ComicBurstShapeKind;
  /** Stable seed key (usually text or explicit seed). */
  seedKey: string | number;
  /**
   * Scale for left/right spike length only (1 = full, 0.5 = half).
   * Top/bottom spikes stay full length. Used for long labels to avoid side clip.
   */
  sideSpikeLengthScale?: number;
};

export type ComicBurstLayout = {
  width: number;
  height: number;
  cx: number;
  cy: number;
  d: string;
};

type Point = { x: number; y: number };

function ellipsePoint(cx: number, cy: number, rx: number, ry: number, angle: number): Point {
  return {
    x: cx + rx * Math.cos(angle),
    y: cy + ry * Math.sin(angle),
  };
}

function lerp(a: Point, b: Point, t: number): Point {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

function fmt(n: number): string {
  return n.toFixed(2);
}

function buildEllipsePath(width: number, height: number): ComicBurstLayout {
  const cx = width / 2;
  const cy = height / 2;
  const rx = width / 2 - 2;
  const ry = height / 2 - 2;
  const d = [
    `M ${fmt(cx - rx)} ${fmt(cy)}`,
    `A ${fmt(rx)} ${fmt(ry)} 0 1 0 ${fmt(cx + rx)} ${fmt(cy)}`,
    `A ${fmt(rx)} ${fmt(ry)} 0 1 0 ${fmt(cx - rx)} ${fmt(cy)}`,
    "Z",
  ].join(" ");
  return { width, height, cx, cy, d };
}

function buildSquarePath(
  width: number,
  height: number,
  cornerCount: number,
  sharp = false,
): ComicBurstLayout {
  const cx = width / 2;
  const cy = height / 2;
  const inset = 3;
  const maxR = Math.min(width, height) * 0.22;
  // Longer labels → more rounded corners; sharp rects stay radius 0.
  const r = sharp ? 0 : Math.min(maxR, 6 + cornerCount * 0.55);
  const x0 = inset;
  const y0 = inset;
  const x1 = width - inset;
  const y1 = height - inset;
  if (r <= 0) {
    const d = [
      `M ${fmt(x0)} ${fmt(y0)}`,
      `L ${fmt(x1)} ${fmt(y0)}`,
      `L ${fmt(x1)} ${fmt(y1)}`,
      `L ${fmt(x0)} ${fmt(y1)}`,
      "Z",
    ].join(" ");
    return { width, height, cx, cy, d };
  }
  const d = [
    `M ${fmt(x0 + r)} ${fmt(y0)}`,
    `L ${fmt(x1 - r)} ${fmt(y0)}`,
    `Q ${fmt(x1)} ${fmt(y0)} ${fmt(x1)} ${fmt(y0 + r)}`,
    `L ${fmt(x1)} ${fmt(y1 - r)}`,
    `Q ${fmt(x1)} ${fmt(y1)} ${fmt(x1 - r)} ${fmt(y1)}`,
    `L ${fmt(x0 + r)} ${fmt(y1)}`,
    `Q ${fmt(x0)} ${fmt(y1)} ${fmt(x0)} ${fmt(y1 - r)}`,
    `L ${fmt(x0)} ${fmt(y0 + r)}`,
    `Q ${fmt(x0)} ${fmt(y0)} ${fmt(x0 + r)} ${fmt(y0)}`,
    "Z",
  ].join(" ");
  return { width, height, cx, cy, d };
}

/**
 * Thought-bubble scallops: lobe count grows with spikeCount for longer text.
 */
function buildThoughtPath(
  width: number,
  height: number,
  lobeCount: number,
  randomness: number,
  seedKey: string | number,
): ComicBurstLayout {
  const cx = width / 2;
  const cy = height / 2;
  const rx = (width / 2) * 0.92;
  const ry = (height / 2) * 0.88;
  const rng = createBurstRng(seedKey);
  const count = Math.max(8, Math.floor(lobeCount));
  const points: Point[] = [];

  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const wobble = 0.88 + rng() * randomness * 0.35;
    points.push(ellipsePoint(cx, cy, rx * wobble, ry * wobble, angle));
  }

  const parts: string[] = [];
  const first = points[0]!;
  parts.push(`M ${fmt(first.x)} ${fmt(first.y)}`);
  for (let i = 0; i < count; i += 1) {
    const a = points[i]!;
    const b = points[(i + 1) % count]!;
    const mid = lerp(a, b, 0.5);
    const outward = {
      x: cx + (mid.x - cx) * 1.18,
      y: cy + (mid.y - cy) * 1.18,
    };
    parts.push(`Q ${fmt(outward.x)} ${fmt(outward.y)} ${fmt(b.x)} ${fmt(b.y)}`);
  }
  parts.push("Z");
  return { width, height, cx, cy, d: parts.join(" ") };
}

/**
 * Build a comic impact-burst path: sharp outer spike tips, rounded concave valleys.
 * Deterministic for a given seedKey + geometry params.
 */
export function buildComicBurstPath(options: ComicBurstPathOptions): ComicBurstLayout {
  const {
    width,
    height,
    spikeCount = 12,
    randomness = 0.18,
    kind = "burst",
    seedKey,
    sideSpikeLengthScale = 1,
  } = options;

  if (kind === "circle") {
    return buildEllipsePath(width, height);
  }
  if (kind === "rect") {
    return buildSquarePath(width, height, spikeCount, true);
  }
  if (kind === "square") {
    return buildSquarePath(width, height, spikeCount, false);
  }
  if (kind === "thought") {
    return buildThoughtPath(width, height, spikeCount, randomness, seedKey);
  }

  const cx = width / 2;
  const cy = height / 2;
  const outerRx = (width / 2) * 1.08;
  const outerRy = (height / 2) * 1.22;
  const innerRx = outerRx * 0.66;
  const innerRy = outerRy * 0.64;
  const sideScale = Math.min(1, Math.max(0, sideSpikeLengthScale));

  const rng = createBurstRng(seedKey);
  const count = Math.max(6, Math.floor(spikeCount));
  const tips: Point[] = [];
  const valleys: Point[] = [];

  for (let i = 0; i < count; i += 1) {
    const base = (i / count) * Math.PI * 2 - Math.PI / 2;
    const tipAngle = base + (rng() - 0.5) * randomness * 0.16;
    const tipScale = 0.9 + rng() * randomness * 1.2;
    const fullTip = ellipsePoint(cx, cy, outerRx * tipScale, outerRy * tipScale, tipAngle);
    // |cos| ≈ 1 on left/right, ≈ 0 on top/bottom — shorten only side tips.
    const sideWeight = Math.abs(Math.cos(tipAngle));
    const tipKeep = 1 - sideWeight * (1 - sideScale);
    const innerOnRay = ellipsePoint(cx, cy, innerRx, innerRy, tipAngle);
    tips.push(lerp(innerOnRay, fullTip, tipKeep));

    const mid = ((i + 0.5) / count) * Math.PI * 2 - Math.PI / 2;
    const valleyAngle = mid + (rng() - 0.5) * randomness * 0.05;
    const valleyScale = 0.95 + rng() * randomness * 0.1;
    valleys.push(
      ellipsePoint(cx, cy, innerRx * valleyScale, innerRy * valleyScale, valleyAngle),
    );
  }

  const parts: string[] = [];
  const first = tips[0]!;
  parts.push(`M ${fmt(first.x)} ${fmt(first.y)}`);

  for (let i = 0; i < count; i += 1) {
    const tip = tips[i]!;
    const valley = valleys[i]!;
    const nextTip = tips[(i + 1) % count]!;

    if (i > 0) {
      parts.push(`L ${fmt(tip.x)} ${fmt(tip.y)}`);
    }

    const leave = lerp(tip, valley, 0.38);
    const approach = lerp(nextTip, valley, 0.38);
    parts.push(`L ${fmt(leave.x)} ${fmt(leave.y)}`);
    parts.push(`Q ${fmt(valley.x)} ${fmt(valley.y)} ${fmt(approach.x)} ${fmt(approach.y)}`);
  }

  parts.push("Z");

  return { width, height, cx, cy, d: parts.join(" ") };
}

/** Extra silhouette detail for longer labels (spikes / lobes / corner roundness). */
export function silhouetteDetailForTextLength(base: number, text: string): number {
  const len = text.trim().length;
  if (len <= 5) return base;
  if (len <= 9) return base + 4;
  if (len <= 12) return base + 8;
  return base + 12;
}

export function layoutComicBurstLabel(params: {
  textWidth: number;
  fontSize: number;
  paddingX: number;
  paddingY: number;
  spikeCount: number;
  randomness: number;
  seedKey: string | number;
  kind?: ComicBurstShapeKind;
  text?: string;
}): ComicBurstLayout {
  const {
    textWidth,
    fontSize,
    paddingX,
    paddingY,
    spikeCount,
    randomness,
    seedKey,
    kind = "burst",
    text = "",
  } = params;
  const width = Math.max(72, textWidth + paddingX * 2);
  const height = Math.max(48, fontSize * 1.35 + paddingY * 2);
  const detail = silhouetteDetailForTextLength(spikeCount, text || String(seedKey));
  const sideSpikeLengthScale =
    (text || String(seedKey)).trim().length >= COMIC_BURST_LONG_TEXT_THRESHOLD ? 0.5 : 1;
  return buildComicBurstPath({
    width,
    height,
    spikeCount: detail,
    randomness,
    seedKey,
    kind,
    sideSpikeLengthScale,
  });
}
