/**
 * Deterministic L→R brush paths for mask reveal (viewBox 0 0 314 114).
 * Paths start left of 0 and end past 314 so the leading edge is the brush tip,
 * not a hard SVG clip.
 *
 * Main stroke alone covers the full ink_brush height so mid-animation never
 * leaves horizontal unrevealed stripes. Extra passes only roughen the tip.
 */

export type BrushRevealPathDef = {
  id: string;
  d: string;
  strokeWidth: number;
  delay: number;
  duration: number;
};

export const BRUSH_REVEAL_PATHS: readonly BrushRevealPathDef[] = [
  {
    id: "main",
    // Full-height body — centered at y=57 with width 120 covers the 114 viewBox.
    d: "M -20 57 C 60 52, 160 64, 330 57",
    strokeWidth: 120,
    delay: 0,
    duration: 320,
  },
  {
    id: "upper",
    d: "M -16 32 C 80 26, 200 40, 326 30",
    strokeWidth: 40,
    delay: 18,
    duration: 300,
  },
  {
    id: "lower",
    d: "M -14 82 C 85 88, 195 74, 324 84",
    strokeWidth: 40,
    delay: 28,
    duration: 295,
  },
  {
    id: "rimTop",
    d: "M -18 14 C 75 18, 185 8, 328 16",
    strokeWidth: 32,
    delay: 22,
    duration: 285,
  },
  {
    id: "rimBottom",
    d: "M -15 100 C 78 94, 190 106, 325 98",
    strokeWidth: 32,
    delay: 35,
    duration: 280,
  },
] as const;

/** Label fade starts once the brush is mostly across. */
export const BRUSH_REVEAL_LABEL_DELAY_MS = 200;
export const BRUSH_REVEAL_LABEL_DURATION_MS = 180;
/** Alias: approximate settle time for the full paint. */
export const BRUSH_OPTION_DRAW_MS =
  BRUSH_REVEAL_LABEL_DELAY_MS + BRUSH_REVEAL_LABEL_DURATION_MS;

export const BRUSH_REVEAL_EASE = "out(2)" as const;
