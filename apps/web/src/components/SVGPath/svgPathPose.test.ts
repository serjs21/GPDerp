import {
  canStepBack,
  canStepForward,
  opacityAtStop,
  scaleAtStop,
  stopForHaikuIndex,
} from "./svgPathPose";

describe("svgPathPose", () => {
  it("keeps stop-20 at scale 1 and opacity 1", () => {
    expect(scaleAtStop(20)).toBe(1);
    expect(opacityAtStop(20)).toBe(1);
  });

  it("scales queue stops by 0.6^(20 - i)", () => {
    expect(scaleAtStop(19)).toBeCloseTo(0.6);
    expect(scaleAtStop(18)).toBeCloseTo(0.36);
  });

  it("overrides exit and gone stops", () => {
    expect(scaleAtStop(21)).toBeCloseTo(1.2);
    expect(opacityAtStop(21)).toBeCloseTo(0.5);
    expect(scaleAtStop(22)).toBeCloseTo(1.4);
    expect(opacityAtStop(22)).toBe(0);
  });

  it("maps newest haiku to stop-20 at focus 0", () => {
    expect(stopForHaikuIndex(0, 0)).toBe(20);
    expect(stopForHaikuIndex(1, 0)).toBe(19);
  });

  it("moves the newest haiku to stop-21 when focus is 1", () => {
    expect(stopForHaikuIndex(0, 1)).toBe(21);
    expect(stopForHaikuIndex(1, 1)).toBe(20);
  });

  it("blocks back-scroll when the first lantern is on stop-20", () => {
    expect(canStepBack(0)).toBe(false);
    expect(canStepBack(1)).toBe(true);
  });

  it("blocks forward-scroll when the last lantern is on stop-20", () => {
    expect(canStepForward(0, 1)).toBe(false);
    expect(canStepForward(2, 3)).toBe(false);
    expect(canStepForward(0, 3)).toBe(true);
  });
});
