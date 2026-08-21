/**
 * Fullscreen split seam (viewBox 0 0 100 100).
 * - sCurve: AuthDualityToggle-style S (amp bows left upper / right lower)
 * - straight: vertical midline, no bow
 */
const SPLIT_X = 50;
/** Horizontal bow of the S — higher = rounder, more expressed duality seam. */
const SEAM_AMP = 30;

export type PathSeam = "sCurve" | "straight";

function seamAmp(seam: PathSeam): number {
  return seam === "straight" ? 0 : SEAM_AMP;
}

function seamControls(splitX: number, amp: number) {
  return {
    c1x: splitX - amp,
    c1y: 22,
    c2x: splitX + amp,
    c2y: 78,
  };
}

/** Dark (left) fill — ends on the seam. */
export function yinYangDarkPath(splitX = SPLIT_X, amp = SEAM_AMP): string {
  const { c1x, c1y, c2x, c2y } = seamControls(splitX, amp);
  return `M 0 0 H ${splitX} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${splitX} 100 H 0 Z`;
}

/** Light (right) fill — starts on the same seam (reversed). */
export function yinYangLightPath(splitX = SPLIT_X, amp = SEAM_AMP): string {
  const { c1x, c1y, c2x, c2y } = seamControls(splitX, amp);
  return `M ${splitX} 0 H 100 V 100 H ${splitX} C ${c2x} ${c2y}, ${c1x} ${c1y}, ${splitX} 0 Z`;
}

/** Open seam path only (for sampling / stroke). */
export function yinYangSeamPath(splitX = SPLIT_X, amp = SEAM_AMP): string {
  const { c1x, c1y, c2x, c2y } = seamControls(splitX, amp);
  return `M ${splitX} 0 C ${c1x} ${c1y}, ${c2x} ${c2y}, ${splitX} 100`;
}

/** Unit-space (0–1) dark path for CSS/SVG clipPathUnits="objectBoundingBox". */
export function yinYangDarkPathUnit(splitX = SPLIT_X, amp = SEAM_AMP): string {
  const { c1x, c1y, c2x, c2y } = seamControls(splitX, amp);
  const s = splitX / 100;
  return `M 0 0 H ${s} C ${c1x / 100} ${c1y / 100}, ${c2x / 100} ${c2y / 100}, ${s} 1 H 0 Z`;
}

/** Unit-space (0–1) light path for objectBoundingBox clip. */
export function yinYangLightPathUnit(splitX = SPLIT_X, amp = SEAM_AMP): string {
  const { c1x, c1y, c2x, c2y } = seamControls(splitX, amp);
  const s = splitX / 100;
  return `M ${s} 0 H 1 V 1 H ${s} C ${c2x / 100} ${c2y / 100}, ${c1x / 100} ${c1y / 100}, ${s} 0 Z`;
}

/**
 * Seam x at unit y ∈ [0,1].
 * Dark half is x ≤ seamX.
 */
export function yinYangSeamXAtY(
  yUnit: number,
  splitX = SPLIT_X,
  amp = SEAM_AMP,
): number {
  if (amp === 0) return splitX / 100;

  const { c1x, c1y, c2x, c2y } = seamControls(splitX, amp);
  const s = splitX / 100;
  const p1x = c1x / 100;
  const p1y = c1y / 100;
  const p2x = c2x / 100;
  const p2y = c2y / 100;
  const y = Math.min(1, Math.max(0, yUnit));

  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 20; i++) {
    const t = (lo + hi) / 2;
    const mt = 1 - t;
    const by = 3 * mt * mt * t * p1y + 3 * mt * t * t * p2y + t * t * t;
    if (by < y) lo = t;
    else hi = t;
  }

  const t = (lo + hi) / 2;
  const mt = 1 - t;
  return (
    mt * mt * mt * s +
    3 * mt * mt * t * p1x +
    3 * mt * t * t * p2x +
    t * t * t * s
  );
}

/** True when unit point falls in the dark (left) half for the given seam. */
export function isDarkSide(
  xUnit: number,
  yUnit: number,
  seam: PathSeam = "sCurve",
  splitX = SPLIT_X,
): boolean {
  return xUnit <= yinYangSeamXAtY(yUnit, splitX, seamAmp(seam));
}

function pathToMaskDataUri(pathD: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path fill="white" d="${pathD}"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export function yinYangDarkMaskImage(splitX = SPLIT_X, amp = SEAM_AMP): string {
  return pathToMaskDataUri(yinYangDarkPath(splitX, amp));
}

export function yinYangLightMaskImage(splitX = SPLIT_X, amp = SEAM_AMP): string {
  return pathToMaskDataUri(yinYangLightPath(splitX, amp));
}

export function darkPathUnitForSeam(seam: PathSeam): string {
  return yinYangDarkPathUnit(SPLIT_X, seamAmp(seam));
}

export function lightPathUnitForSeam(seam: PathSeam): string {
  return yinYangLightPathUnit(SPLIT_X, seamAmp(seam));
}

export function darkMaskForSeam(seam: PathSeam): string {
  return yinYangDarkMaskImage(SPLIT_X, seamAmp(seam));
}

export function lightMaskForSeam(seam: PathSeam): string {
  return yinYangLightMaskImage(SPLIT_X, seamAmp(seam));
}
