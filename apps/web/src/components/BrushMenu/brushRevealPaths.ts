/**
 * Deterministic L→R brush paths for mask reveal (viewBox 0 0 240 40).
 * Paths start left of 0 and end past 240 so the leading edge is the brush tip,
 * not a hard SVG clip.
 */

export type BrushRevealPass = "main" | "upper" | "lower";

export type BrushRevealPathDef = {
  pass: BrushRevealPass;
  d: string;
  strokeWidth: number;
};

export const BRUSH_REVEAL_PATHS: readonly BrushRevealPathDef[] = [
  {
    pass: "main",
    // Broad center stroke — mild S-curve through the label body.
    d: "M -15 21 C 45 18, 120 24, 255 20",
    strokeWidth: 30,
  },
  {
    pass: "upper",
    d: "M -10 13 C 65 16, 155 11, 250 15",
    strokeWidth: 8,
  },
  {
    pass: "lower",
    d: "M -8 30 C 70 27, 155 34, 248 29",
    strokeWidth: 7,
  },
] as const;

/** Timing for multi-pass paint (ms). */
export const BRUSH_REVEAL_MAIN_DELAY_MS = 0;
export const BRUSH_REVEAL_MAIN_DURATION_MS = 320;
export const BRUSH_REVEAL_UPPER_DELAY_MS = 40;
export const BRUSH_REVEAL_UPPER_DURATION_MS = 280;
export const BRUSH_REVEAL_LOWER_DELAY_MS = 65;
export const BRUSH_REVEAL_LOWER_DURATION_MS = 280;
/** Label fade starts once the brush is mostly across. */
export const BRUSH_REVEAL_LABEL_DELAY_MS = 200;
export const BRUSH_REVEAL_LABEL_DURATION_MS = 180;
/** Alias: approximate settle time for the full paint. */
export const BRUSH_OPTION_DRAW_MS =
  BRUSH_REVEAL_LABEL_DELAY_MS + BRUSH_REVEAL_LABEL_DURATION_MS;

export const BRUSH_REVEAL_EASE = "out(2)" as const;

export const BRUSH_REVEAL_PASS_TIMING: Record<
  BrushRevealPass,
  { delay: number; duration: number }
> = {
  main: {
    delay: BRUSH_REVEAL_MAIN_DELAY_MS,
    duration: BRUSH_REVEAL_MAIN_DURATION_MS,
  },
  upper: {
    delay: BRUSH_REVEAL_UPPER_DELAY_MS,
    duration: BRUSH_REVEAL_UPPER_DURATION_MS,
  },
  lower: {
    delay: BRUSH_REVEAL_LOWER_DELAY_MS,
    duration: BRUSH_REVEAL_LOWER_DURATION_MS,
  },
};
