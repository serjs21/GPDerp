import {
  lanternExitPathS,
  lanternInitialPathS,
} from "./lanternFlightPath";
import {
  getCarouselLanternStopIndex,
} from "./lanternCarouselSteps";
import { shouldUseStop0SegmentForPushOut } from "./lanternCarouselOpacity";
import { journeySForCarouselStep } from "./lanternRouteStops";
import {
  getLanternPushOutTransform,
  type AnimatedLanternQueueSlot,
} from "./lanternQueueExitAnimation";
import { easeInOutCubic } from "./lanternTransform";

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Carousel push-out: hide the stop-0 lantern while shifting followers one stop toward exit.
 * - departing offset: push transform off-screen
 * - next rearmost (departing - 1): fade along segment-0 toward stop-0
 * - earlier offsets: journey lerp one carousel stop toward exit
 */
export function resolveCarouselPushOutSlots(
  phaseT: number,
  stepIndex: number,
  departingOffset: number,
  fromJourneys: readonly number[],
): Array<{ index: number; slot: AnimatedLanternQueueSlot }> {
  const eased = easeInOutCubic(phaseT);
  const slots: Array<{ index: number; slot: AnimatedLanternQueueSlot }> = [];

  for (let offset = 0; offset <= departingOffset; offset += 1) {
    if (offset === departingOffset) {
      slots.push({
        index: offset,
        slot: { transform: getLanternPushOutTransform(eased) },
      });
      continue;
    }

    if (shouldUseStop0SegmentForPushOut(offset, departingOffset)) {
      const pathS = lerp(lanternInitialPathS(), lanternExitPathS(), phaseT);
      slots.push({ index: offset, slot: { pathS } });
      continue;
    }

    const fromJourney = fromJourneys[offset] ?? journeySForCarouselStep(
      getCarouselLanternStopIndex(stepIndex, offset),
    );
    const toJourney = journeySForCarouselStep(offset);
    slots.push({
      index: offset,
      slot: { journeyS: lerp(fromJourney, toJourney, eased) },
    });
  }

  return slots;
}
