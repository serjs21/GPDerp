import type { CSSProperties } from "react";
import {
  CREATION_ENTER_MS,
  SVG_PATH_EXIT_OPACITY,
  SVG_PATH_EXIT_SCALE,
} from "@/components/SVGPath";
import {
  SHARED_HAIKU_FLY_DELAY_MS,
  SHARED_HAIKU_FLY_FROM_X,
  SHARED_HAIKU_FLY_FROM_Y,
  SHARED_HAIKU_TYPING_AFTER_LAND_MS,
} from "../consts/sharedHaikuFlyInConsts";

/**
 * Same duration and starting pose (exit stop) as the path creation fly-in;
 * `--text-typing-delay` starts the lantern's TextTyping once it has landed.
 */
export function sharedHaikuFlyInStyle(): CSSProperties {
  return {
    "--shared-haiku-fly-delay-ms": `${SHARED_HAIKU_FLY_DELAY_MS}ms`,
    "--shared-haiku-fly-ms": `${CREATION_ENTER_MS}ms`,
    "--shared-haiku-fly-from-x": SHARED_HAIKU_FLY_FROM_X,
    "--shared-haiku-fly-from-y": SHARED_HAIKU_FLY_FROM_Y,
    "--shared-haiku-fly-from-scale": String(SVG_PATH_EXIT_SCALE),
    "--shared-haiku-fly-from-opacity": String(SVG_PATH_EXIT_OPACITY),
    "--text-typing-delay": `${SHARED_HAIKU_FLY_DELAY_MS + CREATION_ENTER_MS + SHARED_HAIKU_TYPING_AFTER_LAND_MS}ms`,
  } as CSSProperties;
}
