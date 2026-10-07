export const GAVEL_SRC = "/nav/gavel.svg";
export const GAVEL_BASE_SRC = "/nav/gavel-base.svg";

/** SVG viewBox sizes; both assets are drawn at the same scale. */
export const GAVEL_VIEWBOX = { width: 783.12, height: 597.36 } as const;
export const GAVEL_BASE_VIEWBOX = { width: 463, height: 204.11 } as const;

/** Handle end (gavel viewBox units) — the gavel swings around this point. */
export const GAVEL_PIVOT = { x: 783.12, y: 308 } as const;

/** Struck pose: gavel at the top, base left-aligned directly under the head. */
export const ORDER_DROPDOWN_COVER_STAGE = {
  width: GAVEL_VIEWBOX.width,
  height: GAVEL_VIEWBOX.height + GAVEL_BASE_VIEWBOX.height,
} as const;

/** Clockwise lift of the resting (raised) gavel. */
export const GAVEL_RAISED_DEG = 45;
export const GAVEL_STRIKE_MS = 200;
export const GAVEL_RETURN_MS = 300;

export const ORDER_DROPDOWN_COVER_WIDTH_REM = 4;
