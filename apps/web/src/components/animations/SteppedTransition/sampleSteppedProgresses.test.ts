import { evenSteppedProgresses, sampleSteppedProgresses } from "./sampleSteppedProgresses";
import { applyPoseJitter, poseJitter } from "./poseJitter";
import type { TransitionPose } from "./steppedTransitionTypes";

describe("sampleSteppedProgresses", () => {
  it("returns inclusive 0..1 with requested length when even", () => {
    const progresses = sampleSteppedProgresses(5, false);
    expect(progresses).toHaveLength(5);
    expect(progresses[0]).toBe(0);
    expect(progresses.at(-1)).toBe(1);
    expect(evenSteppedProgresses(2)).toEqual([0, 1]);
  });

  it("uses irregular baked samples for poseCount 8", () => {
    const progresses = sampleSteppedProgresses(8, true);
    expect(progresses).toHaveLength(8);
    expect(progresses[0]).toBe(0);
    expect(progresses[1]).toBe(0.08);
    expect(progresses.at(-1)).toBe(1);
    // Not perfectly even.
    const gaps = progresses.slice(1).map((p, i) => p - progresses[i]!);
    const uniqueGaps = new Set(gaps.map((g) => g.toFixed(4)));
    expect(uniqueGaps.size).toBeGreaterThan(1);
  });
});

describe("poseJitter", () => {
  it("is stable for the same poseIndex and seed", () => {
    expect(poseJitter(3, 42)).toEqual(poseJitter(3, 42));
  });

  it("differs across pose indices", () => {
    expect(poseJitter(0, 42)).not.toEqual(poseJitter(1, 42));
  });

  it("applies once without changing progress", () => {
    const pose: TransitionPose = {
      progress: 0.5,
      x: 10,
      y: -20,
      rotation: 0,
      scale: 1,
    };
    const a = applyPoseJitter(pose, 2, 7);
    const b = applyPoseJitter(pose, 2, 7);
    expect(a).toEqual(b);
    expect(a.progress).toBe(0.5);
    expect(Math.abs(a.x - pose.x)).toBeLessThanOrEqual(2);
  });
});
