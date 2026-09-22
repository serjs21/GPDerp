"use client";

import { resolveRough } from "@/components/DrawnModal/roughUtils";

type RoughSvg = {
  line: (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    options?: Record<string, unknown>,
  ) => SVGGElement;
};

const SVG_NS = "http://www.w3.org/2000/svg";

/** Stable seed — same size/state redraws the same comic ink. */
const OUTLINE_SEED = 71;

const DEFAULT_STROKE = "rgba(208, 225, 206, 0.95)";
const INSET = 3;
const DASH_MIN = 9;
const DASH_MAX = 18;
const GAP_MIN = 4;
const GAP_MAX = 8;
const JITTER_MAX = 1.5;
/** Share of dashes that get a more bent / rough stroke. */
const WILD_DASH_CHANCE = 0.12;

export type DropAreaRoughOutlineOptions = {
  /** Border stroke; preserves DropArea color states when provided. */
  stroke?: string;
};

type PaintState = {
  observer: ResizeObserver;
  stroke: string;
};

const paintStateBySvg = new WeakMap<SVGSVGElement, PaintState>();

/** Mulberry32 — deterministic [0, 1) from a 32-bit seed. */
function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function lerp(min: number, max: number, t: number) {
  return min + (max - min) * t;
}

function roundedRectPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): string {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  return [
    `M ${x + r} ${y}`,
    `H ${x + width - r}`,
    `A ${r} ${r} 0 0 1 ${x + width} ${y + r}`,
    `V ${y + height - r}`,
    `A ${r} ${r} 0 0 1 ${x + width - r} ${y + height}`,
    `H ${x + r}`,
    `A ${r} ${r} 0 0 1 ${x} ${y + height - r}`,
    `V ${y + r}`,
    `A ${r} ${r} 0 0 1 ${x + r} ${y}`,
    "Z",
  ].join(" ");
}

function unitNormalAt(
  path: SVGPathElement,
  length: number,
  total: number,
): { nx: number; ny: number } {
  const delta = 0.75;
  const a = path.getPointAtLength(Math.max(0, length - delta));
  const b = path.getPointAtLength(Math.min(total, length + delta));
  const tx = b.x - a.x;
  const ty = b.y - a.y;
  const mag = Math.hypot(tx, ty) || 1;
  return { nx: -ty / mag, ny: tx / mag };
}

function applyRoundCaps(group: SVGGElement): void {
  for (const el of group.querySelectorAll("path, line")) {
    el.setAttribute("stroke-linecap", "round");
    el.setAttribute("stroke-linejoin", "round");
  }
}

function drawComicDashedOutline(svg: SVGSVGElement, stroke: string): void {
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  const width = Math.max(1, svg.clientWidth || svg.getBoundingClientRect().width);
  const height = Math.max(1, svg.clientHeight || svg.getBoundingClientRect().height);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));

  const innerW = Math.max(1, width - INSET * 2);
  const innerH = Math.max(1, height - INSET * 2);
  const radius = Math.min(14, innerW / 10, innerH / 10);

  const measure = document.createElementNS(SVG_NS, "path");
  measure.setAttribute("d", roundedRectPath(INSET, INSET, innerW, innerH, radius));
  measure.setAttribute("fill", "none");
  measure.setAttribute("visibility", "hidden");
  measure.style.pointerEvents = "none";
  svg.appendChild(measure);

  const total = measure.getTotalLength();
  if (!(total > 0)) {
    measure.remove();
    return;
  }

  const rough = resolveRough() as unknown as {
    svg: (el: SVGSVGElement, config?: { options?: { seed?: number } }) => RoughSvg;
  };
  const rc = rough.svg(svg, { options: { seed: OUTLINE_SEED } });
  const rng = mulberry32(OUTLINE_SEED ^ (Math.round(width) * 73856093) ^ (Math.round(height) * 19349663));

  const root = document.createElementNS(SVG_NS, "g");
  root.setAttribute("aria-hidden", "true");

  let cursor = 0;
  let dashIndex = 0;
  // Stop before overlapping the start; leave a small seam gap.
  const endLimit = total - GAP_MIN;

  while (cursor < endLimit) {
    const dashLen = lerp(DASH_MIN, DASH_MAX, rng());
    const gap = lerp(GAP_MIN, GAP_MAX, rng());
    const startLen = cursor;
    const endLen = Math.min(endLimit, cursor + dashLen);
    if (endLen - startLen < 2) break;

    const p0 = measure.getPointAtLength(startLen);
    const p1 = measure.getPointAtLength(endLen);
    const n0 = unitNormalAt(measure, startLen, total);
    const n1 = unitNormalAt(measure, endLen, total);
    const j0 = (rng() * 2 - 1) * JITTER_MAX;
    const j1 = (rng() * 2 - 1) * JITTER_MAX;

    const x1 = p0.x + n0.nx * j0;
    const y1 = p0.y + n0.ny * j0;
    const x2 = p1.x + n1.nx * j1;
    const y2 = p1.y + n1.ny * j1;

    const wild = rng() < WILD_DASH_CHANCE;
    const strokeWidth = lerp(1.15, 1.85, rng());
    const roughness = wild ? lerp(1.1, 1.55, rng()) : lerp(0.3, 0.75, rng());
    const bowing = wild ? lerp(0.85, 1.35, rng()) : lerp(0.15, 0.55, rng());

    const segment = rc.line(x1, y1, x2, y2, {
      stroke,
      strokeWidth,
      roughness,
      bowing,
      fill: "transparent",
      seed: OUTLINE_SEED + dashIndex * 97,
      disableMultiStroke: false,
    });
    applyRoundCaps(segment);
    root.appendChild(segment);

    cursor = endLen + gap;
    dashIndex += 1;
  }

  measure.remove();
  svg.appendChild(root);
}

/**
 * Draw a hand-inked comic dashed rounded rect into `svg`.
 * Attaches a ResizeObserver so the border regenerates with DropArea size.
 */
export function paintDropAreaRoughOutline(
  svg: SVGSVGElement,
  options?: DropAreaRoughOutlineOptions,
): void {
  const stroke = options?.stroke ?? DEFAULT_STROKE;
  drawComicDashedOutline(svg, stroke);

  const existing = paintStateBySvg.get(svg);
  if (existing) {
    existing.stroke = stroke;
    return;
  }

  const observer = new ResizeObserver(() => {
    const current = paintStateBySvg.get(svg);
    if (!current) return;
    drawComicDashedOutline(svg, current.stroke);
  });
  paintStateBySvg.set(svg, { observer, stroke });
  observer.observe(svg);
}

export function clearDropAreaRoughOutline(svg: SVGSVGElement | null): void {
  if (!svg) return;
  const state = paintStateBySvg.get(svg);
  if (state) {
    state.observer.disconnect();
    paintStateBySvg.delete(svg);
  }
  while (svg.firstChild) svg.removeChild(svg.firstChild);
}
