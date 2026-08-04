import type { CSSProperties } from "react";
import { LANTERN_DEFAULT_MAX_STEPS } from "./constants";
import {
  getLanternFlightTransform,
  lanternFlightPathAtStep,
} from "./lanternFlightPath";

export type LanternPositionMode = "translate" | "percent";

export type LanternTransform = {
  x: number;
  y: number;
  scale: number;
  rotate: number;
  opacity?: number;
  positionMode?: LanternPositionMode;
};

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Gentle in-out easing for scroll-linked flight. */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/**
 * Discrete flight step mapped to evenly spaced path samples.
 * Step 0 is the path start; maxSteps lands near the path exit.
 */
export function getLanternTransformAtStep(step: number, maxSteps: number = LANTERN_DEFAULT_MAX_STEPS): LanternTransform {
  const flooredStep = Math.max(0, Math.floor(step));
  const pathT = lanternFlightPathAtStep(flooredStep, maxSteps);
  return getLanternFlightTransform(pathT);
}

/**
 * Continuous progress `t ∈ [0, 1]` along the flight path.
 * `LANERN_FLIGHT_PATH_INITIAL` (~0.78) is the primary rest pose at the right dip.
 */
export function getLanternTransformAtProgress(
  progress: number,
  options: { nextLanternPathProgress?: number } = {},
): LanternTransform {
  return getLanternFlightTransform(progress, {
    nextLanternPathT: options.nextLanternPathProgress,
  });
}

export function lanternTransformToCssVars(transform: LanternTransform): CSSProperties {
  const opacity = transform.opacity ?? 1;

  if (transform.positionMode === "percent") {
    return {
      "--lantern-left": `${transform.x * 100}%`,
      "--lantern-top": `${transform.y * 100}%`,
      "--lantern-scale": String(transform.scale),
      "--lantern-rotate": `${transform.rotate}deg`,
      "--lantern-opacity": String(opacity),
    } as CSSProperties;
  }

  return {
    "--lantern-x": `${transform.x}px`,
    "--lantern-y": `${transform.y}px`,
    "--lantern-scale": String(transform.scale),
    "--lantern-rotate": `${transform.rotate}deg`,
    "--lantern-opacity": String(opacity),
  } as CSSProperties;
}

export type LanternTransformInput = {
  step?: number;
  progress?: number;
  maxSteps?: number;
  nextLanternPathProgress?: number;
  transform?: Partial<LanternTransform>;
};

export function resolveLanternTransform(props: LanternTransformInput): LanternTransform {
  if (props.transform) {
    const base =
      props.step !== undefined
        ? getLanternTransformAtStep(props.step, props.maxSteps)
        : props.progress !== undefined
          ? getLanternTransformAtProgress(props.progress, {
              nextLanternPathProgress: props.nextLanternPathProgress,
            })
          : getLanternTransformAtStep(0, props.maxSteps);
    return {
      x: props.transform.x ?? base.x,
      y: props.transform.y ?? base.y,
      scale: props.transform.scale ?? base.scale,
      rotate: props.transform.rotate ?? base.rotate,
      opacity: props.transform.opacity ?? base.opacity,
      positionMode: props.transform.positionMode ?? base.positionMode,
    };
  }

  if (props.step !== undefined) {
    return getLanternTransformAtStep(props.step, props.maxSteps);
  }

  if (props.progress !== undefined) {
    return getLanternTransformAtProgress(props.progress, {
      nextLanternPathProgress: props.nextLanternPathProgress,
    });
  }

  return getLanternTransformAtStep(0, props.maxSteps);
}
