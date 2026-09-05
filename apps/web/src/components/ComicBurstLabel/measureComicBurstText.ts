export const COMIC_BURST_FONT_STACK = 'var(--font-comic-label), "Bangers", sans-serif';

/** Concrete family for canvas measureText (CSS vars do not resolve on canvas). */
export const COMIC_BURST_MEASURE_FAMILY = '"Bangers", sans-serif';

/** Fixed lettering size — longer labels grow the silhouette instead of shrinking type. */
export const COMIC_BURST_DEFAULT_FONT_SIZE = 28;

let canvas: HTMLCanvasElement | null = null;

function getMeasureContext(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!canvas) {
    canvas = document.createElement("canvas");
  }
  return canvas.getContext("2d");
}

/**
 * Measure single-line text width with Bangers.
 * Falls back to a char-count estimate when canvas is unavailable (SSR).
 */
export function measureComicBurstTextWidth(
  text: string,
  fontSize: number = COMIC_BURST_DEFAULT_FONT_SIZE,
  fontFamily: string = COMIC_BURST_MEASURE_FAMILY,
): number {
  const ctx = getMeasureContext();
  if (!ctx) {
    return Math.max(text.length * fontSize * 0.55, fontSize);
  }
  const measureFamily = fontFamily.includes("var(")
    ? COMIC_BURST_MEASURE_FAMILY
    : fontFamily;
  ctx.font = `400 ${fontSize}px ${measureFamily}`;
  return ctx.measureText(text).width;
}

/** Stable display size for KA-BLAM lettering (no shrink for long copy). */
export function burstDisplayFontSize(_text?: string): number {
  return COMIC_BURST_DEFAULT_FONT_SIZE;
}
