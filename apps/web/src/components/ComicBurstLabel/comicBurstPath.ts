import { createBurstRng } from "./comicBurstSeed";

export type ComicBurstPathOptions = {
  width: number;
  height: number;
  spikeCount?: number;
  randomness?: number;
  /** Stable seed key (usually text or explicit seed). */
  seedKey: string | number;
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
    seedKey,
  } = options;

  const cx = width / 2;
  const cy = height / 2;
  const outerRx = (width / 2) * 1.08;
  const outerRy = (height / 2) * 1.22;
  const innerRx = outerRx * 0.66;
  const innerRy = outerRy * 0.64;

  const rng = createBurstRng(seedKey);
  const count = Math.max(6, Math.floor(spikeCount));
  const tips: Point[] = [];
  const valleys: Point[] = [];

  for (let i = 0; i < count; i += 1) {
    const base = (i / count) * Math.PI * 2 - Math.PI / 2;
    const tipAngle = base + (rng() - 0.5) * randomness * 0.16;
    const tipScale = 0.9 + rng() * randomness * 1.2;
    tips.push(ellipsePoint(cx, cy, outerRx * tipScale, outerRy * tipScale, tipAngle));

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
      // Sharp corner at tip
      parts.push(`L ${fmt(tip.x)} ${fmt(tip.y)}`);
    }

    // Straight exit from tip, then quadratic through valley, then approach next tip
    const leave = lerp(tip, valley, 0.38);
    const approach = lerp(nextTip, valley, 0.38);
    parts.push(`L ${fmt(leave.x)} ${fmt(leave.y)}`);
    parts.push(`Q ${fmt(valley.x)} ${fmt(valley.y)} ${fmt(approach.x)} ${fmt(approach.y)}`);
  }

  parts.push("Z");

  return { width, height, cx, cy, d: parts.join(" ") };
}

function fmt(n: number): string {
  return n.toFixed(2);
}

export function layoutComicBurstLabel(params: {
  textWidth: number;
  fontSize: number;
  paddingX: number;
  paddingY: number;
  spikeCount: number;
  randomness: number;
  seedKey: string | number;
}): ComicBurstLayout {
  const { textWidth, fontSize, paddingX, paddingY, spikeCount, randomness, seedKey } = params;
  const width = Math.max(72, textWidth + paddingX * 2);
  const height = Math.max(48, fontSize * 1.35 + paddingY * 2);
  return buildComicBurstPath({
    width,
    height,
    spikeCount,
    randomness,
    seedKey,
  });
}
