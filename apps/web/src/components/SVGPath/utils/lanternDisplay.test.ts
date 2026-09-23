import {
  opacityAtStop,
  scaleAtStop,
  creationFlyProgress,
  generatingLanternTransformAtFlyT,
  SVG_PATH_EXIT_SCALE,
  SVG_PATH_GONE_SCALE,
  SVG_PATH_QUEUE_SCALE_RATIO,
} from "./lanternDisplay";
import { CREATION_FOCUS_INDEX } from "./stops";

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
    expect(scaleAtStop(21)).toBeCloseTo(SVG_PATH_EXIT_SCALE);
    expect(opacityAtStop(21)).toBeCloseTo(0.5);
    expect(scaleAtStop(22)).toBeCloseTo(SVG_PATH_GONE_SCALE);
    expect(opacityAtStop(22)).toBe(0);
  });

  it("keeps generating lantern at creation pose (no exit flash before scroll)", () => {
    expect(creationFlyProgress(0, 0, 1, false)).toBe(1);
    expect(creationFlyProgress(CREATION_FOCUS_INDEX, 0, 0, true)).toBe(1);
    expect(creationFlyProgress(CREATION_FOCUS_INDEX, 0, 0.5, true)).toBe(1);
    expect(creationFlyProgress(CREATION_FOCUS_INDEX, 0, 1, false)).toBe(1);
  });

  it("flies bottom from -exit to +focus while left follows exit→focus segment", () => {
    const parsed = {
      viewBox: { width: 100, height: 100 },
      stopsById: {
        20: { cx: 50, cy: 97.2778 },
        21: { cx: 94.098, cy: 68.8194 },
      },
      segmentsByIndex: {},
    } as import("./parseSplitPathSvg").ParsedSplitPathSvg;

    const start = generatingLanternTransformAtFlyT(parsed, 0);
    const end = generatingLanternTransformAtFlyT(parsed, 1);
    expect(start).not.toBeNull();
    expect(end).not.toBeNull();
    expect(start!.x).toBeCloseTo(0.94098, 3);
    expect((1 - start!.y) * 100).toBeCloseTo(-31.1806, 3);
    expect(end!.x).toBeCloseTo(0.500016, 3);
    expect((1 - end!.y) * 100).toBeCloseTo(2.7222, 3);
    expect(start!.opacity).toBeCloseTo(0.5);
    expect(end!.opacity).toBe(1);
  });
});
