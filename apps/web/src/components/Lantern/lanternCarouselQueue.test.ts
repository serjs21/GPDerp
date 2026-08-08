import { buildCarouselLanternJourneyS, isCarouselLanternVisibleAtStep } from "./lanternCarouselSteps";
import {
  createLanternQueueScrollState,
  requestLanternQueueScrollStep,
  tickLanternQueueAnimation,
  LANTERN_QUEUE_TRANSITION_MS,
} from "./lanternQueueExitAnimation";

function runExitToPushComplete(visibleCount: number) {
  const t0 = 0;
  let state = requestLanternQueueScrollStep(createLanternQueueScrollState(), 1, visibleCount, t0);
  state = tickLanternQueueAnimation(state, t0 + LANTERN_QUEUE_TRANSITION_MS);
  state = requestLanternQueueScrollStep(state, 1, visibleCount, t0 + LANTERN_QUEUE_TRANSITION_MS + 1);
  return tickLanternQueueAnimation(state, t0 + LANTERN_QUEUE_TRANSITION_MS * 2 + 1);
}

function runEnterFromPullToFadeComplete(visibleCount: number) {
  const t0 = 0;
  let state = requestLanternQueueScrollStep(
    { ...createLanternQueueScrollState(), pushedOutCount: 1 },
    -1,
    visibleCount,
    t0,
  );
  state = tickLanternQueueAnimation(state, t0 + LANTERN_QUEUE_TRANSITION_MS);
  state = requestLanternQueueScrollStep(state, -1, visibleCount, t0 + LANTERN_QUEUE_TRANSITION_MS + 1);
  return tickLanternQueueAnimation(state, t0 + LANTERN_QUEUE_TRANSITION_MS * 2 + 1);
}

describe("lantern carousel queue steps", () => {
  it("rests at stop-0 after fade without pushing until the next back step", () => {
    const visibleCount = 5;
    const t0 = 0;
    let state = requestLanternQueueScrollStep(createLanternQueueScrollState(), 1, visibleCount, t0);
    expect(state.phase).toBe("fadeToExit");
    state = tickLanternQueueAnimation(state, t0 + LANTERN_QUEUE_TRANSITION_MS);
    expect(state.phase).toBe("idle");
    expect(state.fadeProgress).toBe(1);
    expect(state.pushedOutCount).toBe(0);

    state = requestLanternQueueScrollStep(state, 1, visibleCount, t0 + LANTERN_QUEUE_TRANSITION_MS + 1);
    expect(state.phase).toBe("pushOut");
  });

  it("hides one lantern per exit cycle without skipping steps", () => {
    const lanternCount = 5;
    let stepIndex = lanternCount - 1;

    for (let hidden = 1; hidden < lanternCount; hidden += 1) {
      const visibleCount = stepIndex + 1;
      const done = runExitToPushComplete(visibleCount);
      expect(done.pushedOutCount).toBe(1);
      stepIndex -= 1;
      buildCarouselLanternJourneyS(stepIndex, lanternCount);
      const visible = Array.from({ length: lanternCount }, (_, offset) =>
        isCarouselLanternVisibleAtStep(stepIndex, offset),
      ).filter(Boolean).length;
      expect(visible).toBe(stepIndex + 1);
    }

    expect(stepIndex).toBe(0);
  });

  it("restores one lantern per enter cycle", () => {
    const lanternCount = 5;
    let stepIndex = 2;

    for (let restored = 0; restored < 2; restored += 1) {
      const visibleCount = stepIndex + 2;
      const done = runEnterFromPullToFadeComplete(visibleCount);
      expect(done.fadeProgress).toBe(0);
      stepIndex += 1;
      buildCarouselLanternJourneyS(stepIndex, lanternCount);
      const visible = Array.from({ length: lanternCount }, (_, offset) =>
        isCarouselLanternVisibleAtStep(stepIndex, offset),
      ).filter(Boolean).length;
      expect(visible).toBe(stepIndex + 1);
    }

    expect(stepIndex).toBe(4);
  });
});
