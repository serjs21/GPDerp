import type { CSSProperties } from "react";
import type { LanternTransform } from "./lanternTransform";

export const LANTERN_FLIGHT_EXIT_MS = 4000;
export const LANTERN_FLIGHT_STEP_MS = 500;

const FLIGHT_DISTANCE_X_MIN_PX = 120;
const FLIGHT_DISTANCE_X_MAX_PX = 280;
const FLIGHT_DISTANCE_Y_MIN_PX = 220;
const FLIGHT_DISTANCE_Y_MAX_PX = 380;

export type LanternFlightStyleInput = {
  positionMode?: LanternTransform["positionMode"];
  x?: number;
  y?: number;
  rotate?: number;
  scale?: number;
};

export type SimulateFlightOptions = {
  random?: () => number;
  /** 1-based step index; min/max distance are divided by this value. */
  callIndex?: number;
};

function flightOffset(random: () => number, callIndex: number): { x: number; y: number } {
  const minX = FLIGHT_DISTANCE_X_MIN_PX / callIndex;
  const maxX = FLIGHT_DISTANCE_X_MAX_PX / callIndex;
  const minY = FLIGHT_DISTANCE_Y_MIN_PX / callIndex;
  const maxY = FLIGHT_DISTANCE_Y_MAX_PX / callIndex;

  const xMagnitude = minX + random() * (maxX - minX);
  const xSign = random() < 0.5 ? -1 : 1;

  const yMagnitude = Math.abs(minY + random() * (maxY - minY));

  return {
    x: xSign * xMagnitude,
    y: -yMagnitude,
  };
}

/** Random end-state CSS vars for a lantern flying away (never downward). */
export function simulateFlight(
  styles: LanternFlightStyleInput,
  options: SimulateFlightOptions = {},
): CSSProperties {
  const random = options.random ?? Math.random;
  const callIndex = Math.max(1, options.callIndex ?? 1);
  const { x, y } = flightOffset(random, callIndex);
  const baseX = styles.x ?? 0;
  const baseY = styles.y ?? 0;
  const baseRotate = styles.rotate ?? 0;

  if (styles.positionMode === "percent") {
    return {
      "--lantern-flight-x": `${x}px`,
      "--lantern-flight-y": `${y}px`,
      "--lantern-opacity": "0",
      "--lantern-scale": "0",
    } as CSSProperties;
  }

  return {
    "--lantern-x": `${baseX + x}px`,
    "--lantern-y": `${baseY + y}px`,
    "--lantern-rotate": `${baseRotate}deg`,
    "--lantern-opacity": "0",
    "--lantern-scale": "0",
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

/** Calls simulateFlight at t=0, 600, 1200, 1800ms; resolves after LANTERN_FLIGHT_EXIT_MS. */
export function runSteppedLanternFlight(
  flightInput: LanternFlightStyleInput,
  onStep: (style: CSSProperties) => void,
): { promise: Promise<void>; cancel: () => void } {
  const timers: ReturnType<typeof setTimeout>[] = [];
  let cancelled = false;
  let callIndex = 0;

  const tick = () => {
    if (cancelled) return;
    callIndex += 1;
    onStep(simulateFlight(flightInput, { callIndex }));
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
