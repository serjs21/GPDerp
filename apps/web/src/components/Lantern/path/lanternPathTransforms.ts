import {
  lanternExitPathS,
  lanternInitialPathS,
} from "./lanternRouteStops";
import {
  sampleLanternJourney,
  sampleLanternSegment0,
} from "./lanternPathSampling";
import { LANTERN_EXIT_STOP_OPACITY } from "./lanternFlightPath.config";

export type LanternFlightTransform = {
  x: number;
  y: number;
  scale: number;
  rotate: number;
  opacity: number;
  positionMode: "percent";
  stackOrder?: number;
};

export function getLanternJourneyTransform(journeyS: number): LanternFlightTransform {
  const sample = sampleLanternJourney(journeyS);
  return {
    x: sample.x,
    y: sample.y,
    scale: sample.scale,
    rotate: 0,
    opacity: sample.opacity,
    positionMode: "percent",
    stackOrder: Math.round((1 - Math.min(1, Math.max(0, journeyS))) * 100),
  };
}

export function getLanternFlightTransform(pathS: number): LanternFlightTransform {
  const sample = sampleLanternSegment0(pathS);
  return {
    x: sample.x,
    y: sample.y,
    scale: sample.scale,
    rotate: 0,
    opacity: sample.opacity,
    positionMode: "percent",
  };
}

export function lanternFlightPathAtStep(step: number, maxSteps: number): number {
  const clampedStep = Math.max(0, Math.min(maxSteps, step));
  if (maxSteps <= 0) return lanternInitialPathS();
  const fadeSpan = lanternExitPathS() - lanternInitialPathS();
  return lanternInitialPathS() + (clampedStep / maxSteps) * fadeSpan;
}

export { LANTERN_EXIT_STOP_OPACITY };
