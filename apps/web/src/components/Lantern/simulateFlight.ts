import type { CSSProperties } from "react";
import type { LanternTransform } from "./lanternTransform";

export const LANTERN_FLIGHT_EXIT_MS = 2000;

const FLIGHT_DISTANCE_MIN_PX = 380;
const FLIGHT_DISTANCE_MAX_PX = 580;

export type LanternFlightStyleInput = {
  positionMode?: LanternTransform["positionMode"];
  x?: number;
  y?: number;
  rotate?: number;
  scale?: number;
};

export type SimulateFlightOptions = {
  random?: () => number;
};

function flightOffset(random: () => number): { x: number; y: number } {
  const angle = -Math.PI + random() * Math.PI;
  const distance = FLIGHT_DISTANCE_MIN_PX + random() * (FLIGHT_DISTANCE_MAX_PX - FLIGHT_DISTANCE_MIN_PX);
  return {
    x: Math.cos(angle) * distance,
    y: -Math.abs(Math.sin(angle) * distance),
  };
}

/** Random end-state CSS vars for a lantern flying away (never downward). */
export function simulateFlight(
  styles: LanternFlightStyleInput,
  options: SimulateFlightOptions = {},
): CSSProperties {
  const random = options.random ?? Math.random;
  const { x, y } = flightOffset(random);
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
