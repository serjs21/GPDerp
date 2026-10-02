import type { CSSProperties } from "react";
import {
  CREATION_ENTER_MS,
  SVG_PATH_EXIT_OPACITY,
  SVG_PATH_EXIT_SCALE,
} from "@/components/SVGPath";

/** Same duration and starting pose (exit stop) as the path creation fly-in. */
export function notFoundFlyInStyle(): CSSProperties {
  return {
    "--not-found-fly-ms": `${CREATION_ENTER_MS}ms`,
    "--not-found-fly-from-scale": String(SVG_PATH_EXIT_SCALE),
    "--not-found-fly-from-opacity": String(SVG_PATH_EXIT_OPACITY),
  } as CSSProperties;
}
