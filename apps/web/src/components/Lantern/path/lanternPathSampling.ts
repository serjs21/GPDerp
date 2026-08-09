import { LANTERN_EXIT_STOP_OPACITY } from "./lanternFlightPath.config";
import {
  opacityAtJourneyS,
  opacityAtPathS,
  scaleAtJourneyS,
  scaleAtPathS,
} from "./lanternFlightPathStops.config";
import {
  LANTERN_ROUTE_JOURNEY,
  lanternExitPathS,
  sampleLanternJourneyPath,
} from "./lanternRouteStops";
import { pointAtFlightArcLength } from "./lanternFlightPathSvg";

export type LanternPathSample = {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  rotate: number;
};

/** Sample carousel journey position (stop-1 … stop-16). */
export function sampleLanternJourney(journeyS: number): LanternPathSample {
  const sample = sampleLanternJourneyPath(LANTERN_ROUTE_JOURNEY, journeyS, scaleAtJourneyS(journeyS));
  return {
    x: sample.x,
    y: sample.y,
    scale: sample.scale,
    opacity: opacityAtJourneyS(journeyS),
    rotate: 0,
  };
}

/** Sample segment-0 fade zone at pathS (stop-1 ↔ stop-0). */
export function sampleLanternSegment0(pathS: number, opacity = opacityAtPathS(pathS)): LanternPathSample {
  const point = pointAtFlightArcLength(pathS);
  return {
    x: point.x,
    y: point.y,
    scale: scaleAtPathS(pathS),
    opacity,
    rotate: 0,
  };
}

export function isLanternVisibleAtJourneyS(journeyS: number): boolean {
  if (journeyS > 1 + 1e-6) return false;
  if (journeyS < 0) return false;
  return scaleAtJourneyS(journeyS) > 0;
}

export function isLanternVisibleAtPathS(pathS: number): boolean {
  if (pathS > lanternExitPathS() + 0.02) return false;
  return scaleAtPathS(pathS) > 0 || opacityAtPathS(pathS) > 0;
}
