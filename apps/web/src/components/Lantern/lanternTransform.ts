import type { CSSProperties } from "react";
import {
  LANTERN_DEFAULT_MAX_STEPS,
  LANTERN_ROTATE_DEG,
  LANTERN_SCALE_PER_STEP,
  LANTERN_STEP_X_PX,
  LANTERN_STEP_Y_PX,
} from "./constants";

export type LanternTransform = {
  x: number;
  y: number;
  scale: number;
  rotate: number;
};

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Gentle in-out easing for scroll-linked flight. */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/**
 * Discrete flight step from the concept sheet.
 * Step 0 is front-facing primary; later steps scale down and zig-zag rotate.
 */
export function getLanternTransformAtStep(step: number): LanternTransform {
  const s = Math.max(0, Math.floor(step));
  const scale = LANTERN_SCALE_PER_STEP ** s;
  const rotate =
    s === 0 ? 0 : s % 2 === 1 ? -LANTERN_ROTATE_DEG : LANTERN_ROTATE_DEG;

  return {
    x: s === 0 ? 0 : s * LANTERN_STEP_X_PX,
    y: s === 0 ? 0 : s * LANTERN_STEP_Y_PX,
    scale,
    rotate,
  };
}

/**
 * Continuous progress `t ∈ [0, 1]` along `maxSteps` discrete landmarks.
 * Interpolates position, scale, and rotation for smooth scroll driving.
 */
export function getLanternTransformAtProgress(
  progress: number,
  maxSteps: number = LANTERN_DEFAULT_MAX_STEPS,
): LanternTransform {
  const clamped = Math.min(1, Math.max(0, progress));
  const eased = easeInOutCubic(clamped);
  const continuous = eased * maxSteps;
  const step0 = Math.floor(continuous);
  const step1 = Math.min(maxSteps, step0 + 1);
  const localT = continuous - step0;
  const a = getLanternTransformAtStep(step0);
  const b = getLanternTransformAtStep(step1);

  return {
    x: lerp(a.x, b.x, localT),
    y: lerp(a.y, b.y, localT),
    scale: lerp(a.scale, b.scale, localT),
    rotate: lerp(a.rotate, b.rotate, localT),
  };
}

export function lanternTransformToCssVars(transform: LanternTransform): CSSProperties {
  return {
    "--lantern-x": `${transform.x}px`,
    "--lantern-y": `${transform.y}px`,
    "--lantern-scale": String(transform.scale),
    "--lantern-rotate": `${transform.rotate}deg`,
  } as CSSProperties;
}
