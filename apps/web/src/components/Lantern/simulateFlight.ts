import type { CSSProperties } from "react";
import { lerpPose } from "@/components/SVGPath/utils/lanternDisplay";
import { SPLIT_PATH_MIN_STOP } from "@/components/SVGPath/utils/parseSplitPathSvg";
import { SVG_PATH_FOCUS_STOP, SVG_PATH_GONE_STOP } from "@/components/SVGPath/utils/stops";
import type { LanternTransform } from "./lanternTransform";
import { easeOutCubic } from "./lanternTransform";

export const LANTERN_FLIGHT_EXIT_MS = 3000;
export const LANTERN_FLIGHT_STEP_MS = 600;

const FLIGHT_DISTANCE_X_MIN_PX = 80;
const FLIGHT_DISTANCE_X_MAX_PX = 120;
const FLIGHT_DISTANCE_Y_MIN_PX = 240;
const FLIGHT_DISTANCE_Y_MAX_PX = 330;

export type LanternFlightStyleInput = {
  positionMode?: LanternTransform["positionMode"];
  x?: number;
  y?: number;
  rotate?: number;
  scale?: number;
};

export type FlightAccumulatedOffset = {
  x: number;
  y: number;
};

export type SimulateFlightOptions = {
  random?: () => number;
  /** 1-based step index; min/max distance are divided by this value. */
  callIndex?: number;
  totalCalls?: number;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

function flightOffset(random: () => number, callIndex: number): FlightAccumulatedOffset {
  const minX = FLIGHT_DISTANCE_X_MIN_PX / callIndex;
  const maxX = FLIGHT_DISTANCE_X_MAX_PX / callIndex;
  const minY = FLIGHT_DISTANCE_Y_MIN_PX / callIndex;
  const maxY = FLIGHT_DISTANCE_Y_MAX_PX / callIndex;

  const xMagnitude = minX + random() * (maxX - minX);

  const yMagnitude = Math.abs(minY + random() * (maxY - minY));

  return {
    x: xMagnitude,
    y: -yMagnitude,
  };
}

/** Per-step delta; ranges shrink as callIndex increases. */
export function flightStepDelta(options: {
  random?: () => number;
  callIndex: number;
}): FlightAccumulatedOffset {
  const random = options.random ?? Math.random;
  return flightOffset(random, options.callIndex);
}

/** Path-scroll scale/opacity with ease-out progress (focus → min stop / gone stop). */
export function flightPoseAtCall(callIndex: number, totalCalls: number): { scale: number; opacity: number } {
  const linearT =
    totalCalls <= 1 ? 1 : clamp01((callIndex - 1) / (totalCalls - 1));
  const t = easeOutCubic(linearT);
  const scalePose = lerpPose(SVG_PATH_FOCUS_STOP, SPLIT_PATH_MIN_STOP, t);
  const opacityPose = lerpPose(SVG_PATH_FOCUS_STOP, SVG_PATH_GONE_STOP, t);
  return { scale: scalePose.scale, opacity: opacityPose.opacitygu };
}

export function lanternFlightStepCount(): number {
  return Math.ceil(LANTERN_FLIGHT_EXIT_MS / LANTERN_FLIGHT_STEP_MS);
}

/** CSS vars for a lantern flying away from an accumulated offset (never downward). */
export function simulateFlight(
  styles: LanternFlightStyleInput,
  accumulated: FlightAccumulatedOffset,
  options: SimulateFlightOptions = {},
): CSSProperties {
  const callIndex = Math.max(1, options.callIndex ?? 1);
  const totalCalls = Math.max(1, options.totalCalls ?? lanternFlightStepCount());
  const { scale, opacity } = flightPoseAtCall(callIndex, totalCalls);
  const baseX = styles.x ?? 0;
  const baseY = styles.y ?? 0;
  const baseRotate = styles.rotate ?? 0;
  const baseScale = styles.scale ?? 1;

  if (styles.positionMode === "percent") {
    return {
      "--lantern-flight-x": `${accumulated.x}px`,
      "--lantern-flight-y": `${accumulated.y}px`,
      "--lantern-opacity": String(opacity),
      "--lantern-scale": String(baseScale * scale),
    } as CSSProperties;
  }

  return {
    "--lantern-x": `${baseX + accumulated.x}px`,
    "--lantern-y": `${baseY + accumulated.y}px`,
    "--lantern-rotate": `${baseRotate}deg`,
    "--lantern-opacity": String(opacity),
    "--lantern-scale": String(baseScale * scale),
  } as CSSProperties;
}

export function lanternTransformToFlightInput(transform: LanternTransform): LanternFlightStyleInput {
  return {
    positionMode: transform.positionMode,
    x: transform.positionMode === "translate" ? transform.x : 0,
    y: transform.positionMode === "translate" ? transform.y : 0,
    rotate: transform.rotate,
    scale: transform.scale,
  };
}

export function initialFlightCssVars(
  positionMode: LanternTransform["positionMode"] = "translate",
): CSSProperties {
  if (positionMode === "percent") {
    return {
      "--lantern-flight-x": "0px",
      "--lantern-flight-y": "0px",
    } as CSSProperties;
  }

  return {} as CSSProperties;
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Steps simulateFlight from t=0; each tick adds a delta to the accumulated offset. */
export function runSteppedLanternFlight(
  flightInput: LanternFlightStyleInput,
  onStep: (style: CSSProperties) => void,
): { promise: Promise<void>; cancel: () => void } {
  const timers: ReturnType<typeof setTimeout>[] = [];
  let cancelled = false;
  let callIndex = 0;
  const totalCalls = lanternFlightStepCount();
  let accumulated: FlightAccumulatedOffset = { x: 0, y: 0 };

  const tick = () => {
    if (cancelled) return;
    callIndex += 1;
    const delta = flightStepDelta({ callIndex });
    accumulated = {
      x: accumulated.x + delta.x,
      y: accumulated.y + delta.y,
    };
    onStep(simulateFlight(flightInput, accumulated, { callIndex, totalCalls }));
  };

  tick();
  for (
    let elapsed = LANTERN_FLIGHT_STEP_MS;
    elapsed < LANTERN_FLIGHT_EXIT_MS;
    elapsed += LANTERN_FLIGHT_STEP_MS
  ) {
    timers.push(setTimeout(tick, elapsed));
  }

  const promise = new Promise<void>((resolve) => {
    timers.push(
      setTimeout(() => {
        if (!cancelled) resolve();
      }, LANTERN_FLIGHT_EXIT_MS),
    );
  });

  const cancel = () => {
    cancelled = true;
    for (const timer of timers) clearTimeout(timer);
  };

  return { promise, cancel };
}
