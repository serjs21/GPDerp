/** Stagger-grid cell size in CSS pixels (true squares). */
export const CELL_PX = 10;

export const CELL_DURATION_MS = 300;
export const TOTAL_OPEN_MS = 800;
export const LABEL_DELAY_MS = 800;
export const LABEL_DURATION_MS = 400;
export const OVERLAY_OPACITY = 0.9;

export const DARK_FILL_FALLBACK = "rgba(0, 0, 0, 0.55)";
export const LIGHT_FILL_FALLBACK = "rgba(255, 255, 255, 0.55)";

/** Hover glow (motion) — same filter/textShadow approach as Auth TextToIcon. */
export const GLOW_EASE = [0.38, 0, 0.9, 1] as const;
export const LOBE_GLOW_REST = {
  backgroundColor: "rgba(0, 0, 0, 0)",
  boxShadow: "inset 0 0 0 0 transparent",
} as const;
export const DARK_LOBE_GLOW_SOFT =
  "inset 0 0 4rem 1.5rem rgba(245, 235, 224, 0.22), inset 0 0 1.5rem 0.4rem rgba(255, 255, 255, 0.1)";
export const DARK_LOBE_GLOW_STRONG =
  "inset 0 0 5.5rem 2.25rem rgba(245, 235, 224, 0.38), inset 0 0 2rem 0.6rem rgba(255, 255, 255, 0.18)";
export const LIGHT_LOBE_GLOW_SOFT =
  "inset 0 0 4rem 1.5rem rgba(255, 230, 160, 0.28), inset 0 0 1.5rem 0.4rem rgba(255, 255, 255, 0.14)";
export const LIGHT_LOBE_GLOW_STRONG =
  "inset 0 0 5.5rem 2.25rem rgba(255, 230, 160, 0.45), inset 0 0 2rem 0.6rem rgba(255, 255, 255, 0.22)";
export const LABEL_GLOW_SOFT =
  "0 0 0.55em color-mix(in srgb, #ffffff 48%, transparent), 0 0 1.1em color-mix(in srgb, #ffffff 28%, transparent)";
export const LABEL_GLOW_STRONG =
  "0 0 0.7em color-mix(in srgb, #ffffff 68%, transparent), 0 0 1.4em color-mix(in srgb, #ffffff 40%, transparent)";
export const LABEL_FILTER_SOFT =
  "brightness(1.05) drop-shadow(0 0 0.35em color-mix(in srgb, #ffffff 28%, transparent))";
export const LABEL_FILTER_STRONG =
  "brightness(1.1) drop-shadow(0 0 0.5em color-mix(in srgb, #ffffff 42%, transparent))";
/** Right label sits on the light half (dark ink) — warm parchment halo. */
export const LABEL_RIGHT_GLOW_SOFT =
  "0 0 0.45em color-mix(in srgb, #ffe9a8 55%, transparent), 0 0 1em color-mix(in srgb, #fff4d0 35%, transparent)";
export const LABEL_RIGHT_GLOW_STRONG =
  "0 0 0.65em color-mix(in srgb, #ffe9a8 72%, transparent), 0 0 1.3em color-mix(in srgb, #fff4d0 48%, transparent)";
export const LABEL_RIGHT_FILTER_SOFT =
  "brightness(1.04) drop-shadow(0 0 0.3em color-mix(in srgb, #ffe9a8 40%, transparent))";
export const LABEL_RIGHT_FILTER_STRONG =
  "brightness(1.08) drop-shadow(0 0 0.45em color-mix(in srgb, #ffe9a8 55%, transparent))";
export const LABEL_GLOW_REST = {
  textShadow: "none",
  filter: "brightness(1)",
} as const;
