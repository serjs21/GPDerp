import { appendFileSync } from "node:fs";
import { resolve } from "node:path";
import { resolveLanternTransform } from "./lanternTransform";
import { getLanternFlightTransform, lanternExitPathS, lanternInitialPathS, sampleLanternFlightPath } from "./lanternFlightPath";
import {
  createLanternQueueScrollState,
  getLanternPushOutTransform,
  LANTERN_PUSH_OUT_TARGET_X,
  LANTERN_QUEUE_TRANSITION_MS,
  requestLanternQueueScrollStep,
  resolveAnimatedQueueSlots,
  tickLanternQueueAnimation,
} from "./lanternQueueExitAnimation";

const LOG_PATH = resolve(process.cwd(), "../../.cursor/debug-a4f3b7.log");

function logEvidence(message: string, data: Record<string, unknown>) {
  appendFileSync(
    LOG_PATH,
    `${JSON.stringify({
      sessionId: "a4f3b7",
      runId: "integration",
      location: "lanternQueueExitAnimation.integration.test.ts",
      message,
      data,
      timestamp: Date.now(),
    })}\n`,
  );
}

function resolveNewestOpacity(state: ReturnType<typeof createLanternQueueScrollState>, lanternCount: number) {
  const newest = resolveAnimatedQueueSlots(state, lanternCount).at(-1);
  if (!newest) return null;
  return resolveLanternTransform({
    progress: newest.slot.transform ? undefined : newest.slot.pathS,
    journeyS: newest.slot.journeyS,
    transform: newest.slot.transform,
  });
}

function runPhaseToCompletion(
  state: ReturnType<typeof createLanternQueueScrollState>,
  startTime: number,
) {
  let current = state;
  let now = startTime;
  while (current.phase !== "idle") {
    now += 16;
    current = tickLanternQueueAnimation(current, now);
  }
  return { state: current, endTime: now };
}

describe("lanternQueueExitAnimation integration", () => {
  it("advances follower journeyS in sync with newest segment-0 fade", () => {
    const t0 = 10_000;
    let state = requestLanternQueueScrollStep(createLanternQueueScrollState(), 1, 3, t0);
    const followerJourney: number[] = [];

    for (let frame = 0; frame <= 32; frame += 1) {
      state = tickLanternQueueAnimation(state, t0 + (frame / 32) * LANTERN_QUEUE_TRANSITION_MS);
      const follower = resolveAnimatedQueueSlots(state, 3)[1]?.slot;
      if (follower?.journeyS !== undefined && state.phase === "fadeToExit") {
        followerJourney.push(follower.journeyS);
      }
    }

    logEvidence("follower journey during fadeToExit", { followerJourney });
    expect(followerJourney[0]).toBeGreaterThan(followerJourney.at(-1)!);
    expect(followerJourney[0] - followerJourney.at(-1)!).toBeGreaterThan(0.01);
  });

  it("moves upward along segment-0 during fadeToExit", () => {
    const t0 = 10_000;
    let state = requestLanternQueueScrollStep(createLanternQueueScrollState(), 1, 3, t0);
    const ySamples: number[] = [];

    for (let frame = 0; frame <= 32; frame += 1) {
      state = tickLanternQueueAnimation(state, t0 + (frame / 32) * LANTERN_QUEUE_TRANSITION_MS);
      const resolved = resolveNewestOpacity(state, 3);
      if (resolved && state.phase === "fadeToExit") {
        ySamples.push(resolved.y);
      }
    }

    logEvidence("fadeToExit y samples", { ySamples });
    expect(ySamples[0]).toBeGreaterThan(ySamples.at(-1)!);
    expect(ySamples[0] - ySamples.at(-1)!).toBeGreaterThan(0.5);
  });

  it("fades opacity continuously along segment-0 during fadeToExit", () => {
    const exit = sampleLanternFlightPath(lanternExitPathS());
    const initial = sampleLanternFlightPath(lanternInitialPathS());
    logEvidence("segment endpoints", { initial, exit });

    const t0 = 10_000;
    let state = requestLanternQueueScrollStep(createLanternQueueScrollState(), 1, 3, t0);
    expect(state.phase).toBe("fadeToExit");

    const opacitySamples: number[] = [];
    const pathSamples: number[] = [];
    for (let frame = 0; frame <= 32; frame += 1) {
      state = tickLanternQueueAnimation(state, t0 + (frame / 32) * LANTERN_QUEUE_TRANSITION_MS);
      const resolved = resolveNewestOpacity(state, 3);
      if (resolved) {
        opacitySamples.push(resolved.opacity ?? 1);
        pathSamples.push(state.phase === "fadeToExit" ? (resolveAnimatedQueueSlots(state, 3).at(-1)?.slot.pathS ?? -1) : -1);
      }
    }

    logEvidence("fadeToExit opacity samples", { opacitySamples, pathSamples });

    expect(opacitySamples[0]).toBeCloseTo(1, 2);
    expect(opacitySamples.at(-1)).toBeCloseTo(0.5, 2);
    const mid = opacitySamples[Math.floor(opacitySamples.length / 2)] ?? 1;
    expect(mid).toBeLessThan(0.95);
    expect(mid).toBeGreaterThan(0.55);
    expect(new Set(opacitySamples).size).toBeGreaterThan(3);
  });

  it("pushes off the left edge with visible horizontal travel during pushOut", () => {
    const exit = getLanternFlightTransform(lanternExitPathS());
    const pushed = getLanternPushOutTransform(1);
    logEvidence("pushOut travel", { exitX: exit.x, exitY: exit.y, pushedX: pushed.x, pushedY: pushed.y });

    const t0 = 20_000;
    let state = {
      ...createLanternQueueScrollState(),
      fadeProgress: 1,
    };
    state = requestLanternQueueScrollStep(state, 1, 3, t0);
    expect(state.phase).toBe("pushOut");

    const xSamples: number[] = [];
    const opacitySamples: number[] = [];
    for (let frame = 0; frame < 32; frame += 1) {
      state = tickLanternQueueAnimation(state, t0 + (frame / 32) * LANTERN_QUEUE_TRANSITION_MS);
      const resolved = resolveNewestOpacity(state, 3);
      if (resolved && state.phase === "pushOut") {
        xSamples.push(resolved.x);
        opacitySamples.push(resolved.opacity ?? 1);
      }
    }

    logEvidence("pushOut samples", { xSamples, opacitySamples });

    expect(xSamples[0]).toBeCloseTo(exit.x, 2);
    expect(xSamples.at(-1)).toBeCloseTo(LANTERN_PUSH_OUT_TARGET_X, 2);
    expect(Math.abs(xSamples[0] - xSamples.at(-1)!)).toBeGreaterThan(0.1);
    expect(opacitySamples[0]).toBeCloseTo(0.5, 2);
    expect(opacitySamples.at(-1)).toBeCloseTo(0, 1);
  });

  it("reverses exit with pullIn then fadeFromExit", () => {
    const t0 = 30_000;
    let state = { ...createLanternQueueScrollState(), pushedOutCount: 1 };
    state = requestLanternQueueScrollStep(state, -1, 3, t0);
    expect(state.phase).toBe("pullIn");

    const pullResult = runPhaseToCompletion(state, t0);
    state = pullResult.state;
    expect(state.fadeProgress).toBe(1);

    state = requestLanternQueueScrollStep(state, -1, 3, pullResult.endTime + 1);
    expect(state.phase).toBe("fadeFromExit");

    const opacitySamples: number[] = [];
    for (let frame = 0; frame <= 32; frame += 1) {
      state = tickLanternQueueAnimation(state, pullResult.endTime + 1 + (frame / 32) * LANTERN_QUEUE_TRANSITION_MS);
      const resolved = resolveNewestOpacity(state, 3);
      if (resolved) opacitySamples.push(resolved.opacity ?? 1);
    }

    logEvidence("fadeFromExit opacity samples", { opacitySamples });

    expect(opacitySamples[0]).toBeCloseTo(0.5, 2);
    expect(opacitySamples.at(-1)).toBeCloseTo(1, 2);
  });
});
