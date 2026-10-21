import { LANTERN_LOADER_DEFAULTS } from "../consts/lanternLoaderConsts";
import {
  buildLanternKeyframes,
  buildLanternStyle,
  lanternKeyframesName,
  resolveLanternProps,
} from "./lanternLoaderUtils";

const STEPS = [
  { rotationDeg: -5, xPercent: 0, yPercent: 0, scale: 1, opacity: 1 },
  { rotationDeg: 0, xPercent: 10, yPercent: -4, scale: 1.1, opacity: 0.5 },
  { rotationDeg: 5, xPercent: 0, yPercent: 0, scale: 1, opacity: 1 },
];

describe("buildLanternKeyframes", () => {
  it("places one keyframe per step at i / n and closes the loop on the first step", () => {
    expect(buildLanternKeyframes("lantern", STEPS)).toBe(
      "@keyframes lantern { " +
        "0% { transform: translate(0%, 0%) rotate(-5deg) scale(1); opacity: 1; } " +
        "33.333% { transform: translate(10%, -4%) rotate(0deg) scale(1.1); opacity: 0.5; } " +
        "66.667% { transform: translate(0%, 0%) rotate(5deg) scale(1); opacity: 1; } " +
        "100% { transform: translate(0%, 0%) rotate(-5deg) scale(1); opacity: 1; } }",
    );
  });
});

describe("lanternKeyframesName", () => {
  it("is stable for the same steps and differs when a step changes", () => {
    expect(lanternKeyframesName(STEPS)).toBe(lanternKeyframesName(STEPS.map((step) => ({ ...step }))));
    expect(lanternKeyframesName(STEPS)).not.toBe(lanternKeyframesName([{ ...STEPS[0], opacity: 0.9 }, ...STEPS.slice(1)]));
    expect(lanternKeyframesName(STEPS)).toMatch(/^lanternLoader-[a-z0-9]+$/);
  });
});

describe("buildLanternStyle", () => {
  it("runs one stepTransitionMs per step", () => {
    const resolved = resolveLanternProps({ steps: STEPS, stepTransitionMs: 250 });
    expect(buildLanternStyle(resolved, "lantern")).toMatchObject({
      "--lantern-animation-name": "lantern",
      "--lantern-duration": "750ms",
    });
  });

  it("adds one dot per step (3 dots + the bare word) and places / skews the text", () => {
    const resolved = resolveLanternProps({ stepTransitionMs: 250, textXPercent: 40, textYPercent: 60, textSkewXDeg: -12, textSkewYDeg: 3 });
    expect(buildLanternStyle(resolved, "lantern")).toMatchObject({
      "--lantern-dots-duration": "1000ms",
      "--lantern-text-x": "40%",
      "--lantern-text-y": "60%",
      "--lantern-text-skew-x": "-12deg",
      "--lantern-text-skew-y": "3deg",
    });
  });

  it("falls back to the defaults and to no animation without a keyframes name", () => {
    const resolved = resolveLanternProps({});
    expect(resolved).toEqual(LANTERN_LOADER_DEFAULTS);
    expect(buildLanternStyle(resolved, null)).toMatchObject({ "--lantern-animation-name": "none" });
  });
});
