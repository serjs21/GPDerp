import type { CSSProperties } from "react";
import { BRUSH_OPTION_MIN_WIDTH_REM } from "../brushRevealPaths";

export const BRUSH_MENU_ROOT_STYLE = {
  ["--brush-option-min-width"]: `${BRUSH_OPTION_MIN_WIDTH_REM}rem`,
} as CSSProperties;

/** Closed trigger footprint before the first measurement (avatar-sized). */
export const BRUSH_TRIGGER_FALLBACK_SIZE_PX = 36;
