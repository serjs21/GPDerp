import {
  opacityAtStop,
  scaleAtStop,
  SVG_PATH_QUEUE_SCALE_RATIO,
} from "./lanternDisplay";

describe("lanternDisplay", () => {
  it("keeps stop-20 at scale 1 and opacity 1", () => {
    expect(scaleAtStop(20)).toBe(1);
    expect(opacityAtStop(20)).toBe(1);
  });

  it("scales queue stops by QUEUE_SCALE_RATIO^(20 - i)", () => {
    expect(scaleAtStop(19)).toBeCloseTo(SVG_PATH_QUEUE_SCALE_RATIO);
    expect(scaleAtStop(18)).toBeCloseTo(SVG_PATH_QUEUE_SCALE_RATIO ** 2);
  });

  it("overrides exit and gone stops", () => {
    expect(scaleAtStop(21)).toBeCloseTo(1.2);
    expect(opacityAtStop(21)).toBeCloseTo(0.5);
    expect(scaleAtStop(22)).toBeCloseTo(1.4);
    expect(opacityAtStop(22)).toBe(0);
  });
});
