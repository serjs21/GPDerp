import { SVG_PATH_GONE_STOP } from "../utils/stops";
import { SVG_PATH_LANTERN_WIDTH_REM } from "./pathLanternLayoutConsts";

/** Match SVGPathLantern display width so creation and list share the same box. */
export const CREATION_PATH_LANTERN_WIDTH_REM = SVG_PATH_LANTERN_WIDTH_REM;

/**
 * Above every path lantern (zIndex = 10 + stackOrder, stackOrder = stop*10).
 * Gone stop is the highest authored stop on the path.
 */
export const CREATION_PATH_LANTERN_Z_INDEX = 10 + SVG_PATH_GONE_STOP * 10 + 1;

/**
 * PathOverlay root uses z-index 1000. When far-path chrome is open, the creation
 * lantern must portal above that stacking context while keeping guideBox geometry.
 */
export const CREATION_PATH_LANTERN_ABOVE_CHROME_Z_INDEX = 1001;
