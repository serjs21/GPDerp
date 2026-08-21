/**
 * Fullscreen yin–yang S-seam (viewBox 0 0 100 100), same construction as
 * AuthDualityToggle `yingPath` / reverse complement — shared boundary, no gap.
 * Amp bows left in the upper half and right in the lower half → white larger on top,
 * dark larger on bottom.
 */
const SPLIT_X = 50;
const SEAM_AMP = 18;

function seamControls(splitX: number, amp: number) {
  return {
    c1x: splitX - amp,
    c1y: 27,
    c2x: splitX + amp,
    c2y: 73,
  };
}

/** Dark (left) fill — ends on the S-curve. */
export function yinYangDarkPath(splitX = SPLIT_X, amp = SEAM_AMP): string {
  const { c1x, c1y, c2x, c2y } = seamControls(splitX, amp);
  return `M 0 0 H ${splitX} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${splitX} 100 H 0 Z`;
}

/** Light (right) fill — starts on the same S-curve (reversed). */
export function yinYangLightPath(splitX = SPLIT_X, amp = SEAM_AMP): string {
  const { c1x, c1y, c2x, c2y } = seamControls(splitX, amp);
  return `M ${splitX} 0 H 100 V 100 H ${splitX} C ${c2x} ${c2y}, ${c1x} ${c1y}, ${splitX} 0 Z`;
}

/** Open S-curve only (for seam sampling / stroke). */
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
 * Cubic seam x at unit y ∈ [0,1] (viewBox path M s 0 C … s 1).
 * Dark lobe is x ≤ seamX (left of the S-curve).
 */
export function yinYangSeamXAtY(
  yUnit: number,
  splitX = SPLIT_X,
  amp = SEAM_AMP,
): number {
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

/** True when unit point falls in the dark (left) lobe. */
export function isDarkSide(
  xUnit: number,
  yUnit: number,
  splitX = SPLIT_X,
  amp = SEAM_AMP,
): boolean {
  return xUnit <= yinYangSeamXAtY(yUnit, splitX, amp);
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
