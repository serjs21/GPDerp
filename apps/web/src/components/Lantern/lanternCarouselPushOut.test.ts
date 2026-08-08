import { lanternExitPathS, lanternInitialPathS } from "./lanternFlightPath";
import { buildCarouselLanternJourneyS } from "./lanternCarouselSteps";
import { journeySForCarouselStep } from "./lanternRouteStops";
import { resolveCarouselPushOutSlots } from "./lanternCarouselPushOut";
import {
  createLanternQueueScrollState,
  requestLanternQueueScrollStep,
  resolveAnimatedQueueSlots,
  tickLanternQueueAnimation,
  LANTERN_QUEUE_TRANSITION_MS,
} from "./lanternQueueExitAnimation";

describe("resolveCarouselPushOutSlots", () => {
  it("shifts followers toward exit while the stop-0 lantern pushes out", () => {
    const stepIndex = 2;
    const lanternCount = 3;
    const visibleCount = stepIndex + 1;

    let state = requestLanternQueueScrollStep(createLanternQueueScrollState(), 1, visibleCount, 0);
    state = tickLanternQueueAnimation(state, LANTERN_QUEUE_TRANSITION_MS);
    const rested = resolveAnimatedQueueSlots(state, visibleCount);
    const fromJourneys = buildCarouselLanternJourneyS(stepIndex, lanternCount);
    for (const { index, slot } of rested) {
      if (slot.journeyS !== undefined) {
        fromJourneys[index] = slot.journeyS;
      }
    }

    const start = resolveCarouselPushOutSlots(0, stepIndex, stepIndex, fromJourneys);
    const end = resolveCarouselPushOutSlots(1, stepIndex, stepIndex, fromJourneys);

    const leadStart = start.find((entry) => entry.index === 0)?.slot;
    const leadEnd = end.find((entry) => entry.index === 0)?.slot;
    expect(leadStart?.journeyS).toBeCloseTo(fromJourneys[0], 4);
    expect(leadEnd?.journeyS).toBeCloseTo(journeySForCarouselStep(0), 4);
    expect(leadEnd?.journeyS).toBeLessThan(leadStart?.journeyS ?? 0);

    const nextRearStart = start.find((entry) => entry.index === 1)?.slot;
    const nextRearEnd = end.find((entry) => entry.index === 1)?.slot;
    expect(nextRearStart?.pathS).toBeCloseTo(lanternInitialPathS(), 4);
    expect(nextRearEnd?.pathS).toBeCloseTo(lanternExitPathS(), 4);

    const departingEnd = end.find((entry) => entry.index === 2)?.slot;
    expect(departingEnd?.transform).toBeDefined();
    expect(departingEnd?.transform?.opacity).toBeCloseTo(0, 2);
  });
});
