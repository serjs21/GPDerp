import { LANTERN_EXIT_STOP_OPACITY } from "./lanternFlightPath.config";
import { getLanternQueueRestJourneyS } from "./lanternFlightPath";
import { opacityAtPathS } from "./lanternFlightPathStops.config";
import {
  createLanternQueueScrollState,
  getLanternPushOutTransform,
  isLanternQueueSlotVisible,
  LANTERN_PUSH_OUT_TARGET_X,
  LANTERN_QUEUE_TRANSITION_MS,
  requestLanternQueueScrollStep,
  resolveAnimatedQueueSlots,
  tickLanternQueueAnimation,
} from "./lanternQueueExitAnimation";

describe("lanternQueueExitAnimation", () => {
  it("starts a segment-0 fade when scrolling forward from stop-1", () => {
    const next = requestLanternQueueScrollStep(createLanternQueueScrollState(), 1, 3, 0);
    expect(next.phase).toBe("fadeToExit");
    expect(next.animFromFade).toBe(0);
    expect(next.animToFade).toBe(1);
  });

  it("starts push-out after resting on stop-0", () => {
    const atExit = { ...createLanternQueueScrollState(), fadeProgress: 1 };
    const next = requestLanternQueueScrollStep(atExit, 1, 3, 0);
    expect(next.phase).toBe("pushOut");
  });

  it("restores with pull-in then fade-from-exit on scroll back", () => {
    const pushed = { ...createLanternQueueScrollState(), pushedOutCount: 1 };
    const pull = requestLanternQueueScrollStep(pushed, -1, 3, 0);
    expect(pull.phase).toBe("pullIn");
    expect(pull.pushedOutCount).toBe(0);

    const atExit = { ...pull, phase: "idle" as const, fadeProgress: 1 };
    const fadeBack = requestLanternQueueScrollStep(atExit, -1, 3, 0);
    expect(fadeBack.phase).toBe("fadeFromExit");
    expect(fadeBack.animToFade).toBe(0);
  });

  it("fades opacity evenly over time during fadeToExit", () => {
    const early = {
      ...createLanternQueueScrollState(),
      phase: "fadeToExit" as const,
      phaseT: 0.25,
      animFromFade: 0,
      animToFade: 1,
      animStartTime: 0,
    };
    const slots = resolveAnimatedQueueSlots(early, 3);
    const newest = slots.at(-1);
    expect(opacityAtPathS(newest?.slot.pathS ?? 0)).toBeCloseTo(0.875, 2);
  });

  it("interpolates opacity along segment-0 during fadeToExit", () => {
    const mid = {
      ...createLanternQueueScrollState(),
      phase: "fadeToExit" as const,
      phaseT: 0.5,
      animFromFade: 0,
      animToFade: 1,
      animStartTime: 0,
    };
    const slots = resolveAnimatedQueueSlots(mid, 3);
    const newest = slots.at(-1);
    expect(newest?.slot.pathS).toBeCloseTo(0.5, 2);
    expect(opacityAtPathS(newest?.slot.pathS ?? 0)).toBeCloseTo(0.75, 2);
  });

  it("pushes the lantern toward the left corner while fading out", () => {
    const pushed = getLanternPushOutTransform(1);
    expect(pushed.x).toBe(LANTERN_PUSH_OUT_TARGET_X);
    expect(pushed.opacity).toBeCloseTo(0, 2);
  });

  it("keeps pull-in visible at zero opacity so enter can animate from off-screen", () => {
    const slot = { transform: getLanternPushOutTransform(1) };
    expect(isLanternQueueSlotVisible(slot, "pullIn")).toBe(true);
    expect(isLanternQueueSlotVisible(slot, "idle")).toBe(false);
  });

  it("advances followers one carousel stop while the newest fades along segment-0", () => {
    const mid = {
      ...createLanternQueueScrollState(),
      phase: "fadeToExit" as const,
      phaseT: 0.5,
      animFromFade: 0,
      animToFade: 1,
      animStartTime: 0,
    };
    const slots = resolveAnimatedQueueSlots(mid, 3);
    const lead = slots[0]?.slot;
    const middle = slots[1]?.slot;
    const newest = slots[2]?.slot;

    expect(newest?.pathS).toBeCloseTo(0.5, 2);
    expect(lead?.journeyS).toBeDefined();
    expect(middle?.journeyS).toBeDefined();
    expect(lead?.journeyS).toBeLessThan(getLanternQueueRestJourneyS(0, 3));
    expect(middle?.journeyS).toBeLessThan(getLanternQueueRestJourneyS(1, 3));
  });

  it("uses journeyS for the newest lantern at rest on stop-1", () => {
    const slots = resolveAnimatedQueueSlots(createLanternQueueScrollState(), 3);
    const newest = slots.at(-1);
    expect(newest?.slot.journeyS).toBeDefined();
    expect(newest?.slot.pathS).toBeUndefined();
  });

  it("completes push-out after the transition duration", () => {
    const pushing = {
      ...createLanternQueueScrollState(),
      phase: "pushOut" as const,
      phaseT: 0,
      animStartTime: 0,
    };
    const done = tickLanternQueueAnimation(pushing, LANTERN_QUEUE_TRANSITION_MS);
    expect(done.phase).toBe("idle");
    expect(done.pushedOutCount).toBe(1);
    expect(done.fadeProgress).toBe(0);
  });
});
