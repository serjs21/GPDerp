export const COMIC_BURST_FONT_STACK = 'var(--font-comic-label), "Bangers", sans-serif';

/** Concrete family for canvas measureText (CSS vars do not resolve on canvas). */
export const COMIC_BURST_MEASURE_FAMILY = '"Bangers", sans-serif';

export const COMIC_BURST_DEFAULT_FONT_SIZE = 28;
export const COMIC_BURST_MIN_FONT_SIZE = 14;
/** Fraction of burst width the glyphs may occupy (inner safe zone). */
export const COMIC_BURST_TEXT_WIDTH_RATIO = 0.52;

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

/** Length-based starting size for KA-BLAM lettering. */
export function burstBaseFontSize(text: string): number {
  const len = text.trim().length;
  if (len <= 4) return 32;
  if (len <= 7) return 26;
  return 20;
}

/**
 * Shrink font until measured width fits the burst inner safe zone.
 * Provisional burst width is locked from the length-based base size so
 * fit does not chase a shrinking envelope.
 */
export function fitBurstFontSize(text: string, paddingX: number): number {
  let fontSize = burstBaseFontSize(text);
  const provisionalWidth = measureComicBurstTextWidth(text, fontSize);
  const burstWidth = Math.max(72, provisionalWidth + paddingX * 2);
  const maxTextWidth = burstWidth * COMIC_BURST_TEXT_WIDTH_RATIO;

  for (let i = 0; i < 8; i += 1) {
    const textWidth = measureComicBurstTextWidth(text, fontSize);
    if (textWidth <= maxTextWidth || fontSize <= COMIC_BURST_MIN_FONT_SIZE) {
      return fontSize;
    }
    fontSize = Math.max(
      COMIC_BURST_MIN_FONT_SIZE,
      Math.floor(fontSize * (maxTextWidth / textWidth)),
    );
  }
  return fontSize;
}
