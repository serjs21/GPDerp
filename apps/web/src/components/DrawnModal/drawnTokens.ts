export type DrawnModalSize = "sm" | "md" | "lg";

export const DRAWN_SIZE_MAX_WIDTH: Record<DrawnModalSize, string> = {
  sm: "22rem",
  md: "28rem",
  lg: "36rem",
};

export const DRAWN_INK = "rgba(45, 45, 45, 0.78)";

export const DRAWN_ROUGH = {
  roughness: 1.25,
  bowing: 1.05,
  strokeWidth: 1.4,
  stroke: DRAWN_INK,
  fill: "transparent" as const,
  seed: 42,
};

/** ms per border side */
export const DRAWN_SIDE_MS = 280;
/** ms per X stroke */
export const DRAWN_X_STROKE_MS = 220;
export const DRAWN_EASE = "inOutSine";
export const DRAWN_CONTENT_FADE_MS = 320;
export const DRAWN_OVERLAY_MS = 280;
