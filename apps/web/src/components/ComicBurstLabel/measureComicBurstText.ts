export const COMIC_BURST_FONT_STACK =
  'var(--font-luckiest-guy), "Luckiest Guy", cursive';

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
 * Measure single-line text width with Luckiest Guy.
 * Falls back to a char-count estimate when canvas is unavailable (SSR).
 */
export function measureComicBurstTextWidth(
  text: string,
  fontSize: number = COMIC_BURST_DEFAULT_FONT_SIZE,
  fontFamily: string = COMIC_BURST_FONT_STACK,
): number {
  const ctx = getMeasureContext();
  if (!ctx) {
    return Math.max(text.length * fontSize * 0.62, fontSize);
  }
  // Canvas cannot resolve CSS vars — use the concrete family name for measurement.
  const measureFamily = fontFamily.includes("var(")
    ? '"Luckiest Guy", cursive'
    : fontFamily;
  ctx.font = `italic 400 ${fontSize}px ${measureFamily}`;
  return ctx.measureText(text).width;
}
