import type { CSSProperties } from "react";
import {
  CREATION_ENTER_MS,
  SVG_PATH_EXIT_OPACITY,
  SVG_PATH_EXIT_SCALE,
} from "@/components/SVGPath";
import { NOT_FOUND_FLY_FROM_X, NOT_FOUND_FLY_FROM_Y } from "../consts/notFoundViewConsts";

/** Same duration and starting pose (exit stop) as the path creation fly-in. */
export function notFoundFlyInStyle(): CSSProperties {
  return {
    "--not-found-fly-ms": `${CREATION_ENTER_MS}ms`,
    "--not-found-fly-from-x": NOT_FOUND_FLY_FROM_X,
    "--not-found-fly-from-y": NOT_FOUND_FLY_FROM_Y,
    "--not-found-fly-from-scale": String(SVG_PATH_EXIT_SCALE),
    "--not-found-fly-from-opacity": String(SVG_PATH_EXIT_OPACITY),
  } as CSSProperties;
}
