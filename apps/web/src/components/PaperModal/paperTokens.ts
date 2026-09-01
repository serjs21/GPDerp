export const PAPER_COLORS = {
  base: "#f7f1e6",
  baseWarm: "#f0e6d4",
  stain: "rgba(188, 140, 90, 0.12)",
  stainCool: "rgba(120, 140, 130, 0.08)",
  fiber: "rgba(90, 70, 50, 0.18)",
  ink: "rgba(45, 45, 45, 0.72)",
  inkSoft: "rgba(45, 45, 45, 0.42)",
  edge: "rgba(90, 70, 50, 0.22)",
  shadow: "rgba(40, 30, 20, 0.28)",
  overlay: "rgba(35, 28, 22, 0.42)",
} as const;

export type PaperModalSize = "sm" | "md" | "lg";

export const PAPER_SIZE_MAX_WIDTH: Record<PaperModalSize, string> = {
  sm: "22rem",
  md: "28rem",
  lg: "36rem",
};

export const PAPER_ROUGH_DEFAULTS = {
  roughness: 1.35,
  bowing: 1.1,
  strokeWidth: 1.35,
  fill: "transparent",
  stroke: PAPER_COLORS.ink,
  seed: 42,
} as const;
