import type { CSSProperties } from "react";
import { CREATION_ENTER_MS, SVG_PATH_EXIT_OPACITY } from "@/components/SVGPath";
import {
  SHARED_HAIKU_FLY_DELAY_MS,
  SHARED_HAIKU_FLY_FROM_SCALE,
  SHARED_HAIKU_FLY_FROM_X,
  SHARED_HAIKU_FLY_FROM_Y,
  SHARED_HAIKU_TYPING_STEP_MS,
} from "../consts/sharedHaikuFlyInConsts";

/**
 * Fly-in uses the path creation duration and exit opacity; the lantern's
 * TextTyping (`--text-typing-*`) starts together with the flight.
 */
export function sharedHaikuFlyInStyle(): CSSProperties {
  return {
    "--shared-haiku-fly-delay-ms": `${SHARED_HAIKU_FLY_DELAY_MS}ms`,
    "--shared-haiku-fly-ms": `${CREATION_ENTER_MS}ms`,
    "--shared-haiku-fly-from-x": SHARED_HAIKU_FLY_FROM_X,
    "--shared-haiku-fly-from-y": SHARED_HAIKU_FLY_FROM_Y,
    "--shared-haiku-fly-from-scale": String(SHARED_HAIKU_FLY_FROM_SCALE),
    "--shared-haiku-fly-from-opacity": String(SVG_PATH_EXIT_OPACITY),
    "--text-typing-delay": `${SHARED_HAIKU_FLY_DELAY_MS}ms`,
    "--text-typing-step": `${SHARED_HAIKU_TYPING_STEP_MS}ms`,
  } as CSSProperties;
}
