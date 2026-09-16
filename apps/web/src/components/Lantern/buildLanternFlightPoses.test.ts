import { STEPPED_TRANSITION } from "@/components/animations/SteppedTransition";
import {
  buildLanternFlightPoses,
  createSeededRandom,
  lanternPoseToFlightStyle,
  seedFromHaikuId,
} from "./buildLanternFlightPoses";
import { flightStepDelta } from "./simulateFlight";

describe("buildLanternFlightPoses", () => {
  it("starts near origin and ends farther upward for a fixed seed", () => {
    const poses = buildLanternFlightPoses(
      { positionMode: "percent", scale: 1, rotate: 0 },
      { seed: 42, poseCount: 8 },
    );
    expect(poses).toHaveLength(8);
    expect(poses[0]!.progress).toBe(0);
    expect(poses.at(-1)!.progress).toBe(1);
    expect(Math.abs(poses[0]!.x)).toBeLessThan(3);
    expect(Math.abs(poses[0]!.y)).toBeLessThan(3);
    expect(poses.at(-1)!.y).toBeLessThan(poses[0]!.y);
    expect(poses.at(-1)!.opacity ?? 1).toBeLessThan(poses[0]!.opacity ?? 1);
  });

  it("is deterministic for the same seed", () => {
    const a = buildLanternFlightPoses({ positionMode: "percent" }, { seed: 99 });
    const b = buildLanternFlightPoses({ positionMode: "percent" }, { seed: 99 });
    expect(a).toEqual(b);
  });

  it("differs across seeds", () => {
    const a = buildLanternFlightPoses({ positionMode: "percent" }, { seed: 1 });
    const b = buildLanternFlightPoses({ positionMode: "percent" }, { seed: 2 });
    expect(a[3]).not.toEqual(b[3]);
  });

  it("matches trajectory end from seeded deltas (sans jitter on last anchor)", () => {
    const seed = 7;
    const poseCount = STEPPED_TRANSITION.poseCount;
    const random = createSeededRandom(seed);
    let accumulated = { x: 0, y: 0 };
    for (let callIndex = 1; callIndex < poseCount; callIndex++) {
      const delta = flightStepDelta({ random, callIndex });
      accumulated = {
        x: accumulated.x + delta.x,
        y: accumulated.y + delta.y,
      };
    }
    const poses = buildLanternFlightPoses(
      { positionMode: "percent" },
      { seed, poseCount, irregularSpacing: false },
    );
    const last = poses.at(-1)!;
    expect(Math.abs(last.x - accumulated.x)).toBeLessThan(3);
    expect(Math.abs(last.y - accumulated.y)).toBeLessThan(3);
  });
});

describe("lanternPoseToFlightStyle", () => {
  it("writes percent flight CSS vars", () => {
    const style = lanternPoseToFlightStyle(
      {
        progress: 0.5,
        x: 12,
        y: -40,
        rotation: 3,
        scale: 0.8,
        opacity: 0.6,
      },
      "percent",
    ) as Record<string, string>;
    expect(style["--lantern-flight-x"]).toBe("12px");
    expect(style["--lantern-flight-y"]).toBe("-40px");
    expect(style["--lantern-scale"]).toBe("0.8");
    expect(style["--lantern-opacity"]).toBe("0.6");
    expect(style["--lantern-rotate"]).toBe("3deg");
  });
});

describe("seedFromHaikuId", () => {
  it("is stable and non-zero for common ids", () => {
    expect(seedFromHaikuId("abc")).toBe(seedFromHaikuId("abc"));
    expect(seedFromHaikuId("abc")).not.toBe(seedFromHaikuId("abd"));
    expect(seedFromHaikuId("flight-exit-demo")).toBeGreaterThan(0);
  });
});
