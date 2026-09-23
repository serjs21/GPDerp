import type { LanternTransform } from "@/components/Lantern/lanternTransform";

/** Path lantern display width — shared by SVGPath list, creation overlay, and CreationModal. */
export const SVG_PATH_LANTERN_WIDTH_REM = 19;

/** Authored stop-20 in `split_path_colored_stops.svg` (viewBox 1920×1080). */
export const SVG_PATH_DEFAULT_STOP = {
  cx: 960.03,
  cy: 650.6,
  viewBoxWidth: 1920,
  viewBoxHeight: 1080,
} as const;

/**
 * Fallback default-stop pose when the parsed SVG is unavailable (e.g. CreationModal).
 * Must match `defaultStopLanternTransform(parsed)` for stop-20.
 */
export function defaultStopLanternTransformFallback(): LanternTransform {
  return {
    positionMode: "percent",
    x: SVG_PATH_DEFAULT_STOP.cx / SVG_PATH_DEFAULT_STOP.viewBoxWidth,
    y: SVG_PATH_DEFAULT_STOP.cy / SVG_PATH_DEFAULT_STOP.viewBoxHeight,
    scale: 1,
    rotate: 0,
    opacity: 1,
  };
}
