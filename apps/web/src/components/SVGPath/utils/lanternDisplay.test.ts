import {
  opacityAtStop,
  scaleAtStop,
  creationFlyProgress,
  creationLanternTransformAtFlyT,
  defaultStopLanternTransform,
  generatingLanternTransformAtFlyT,
  SVG_PATH_EXIT_SCALE,
  SVG_PATH_GONE_SCALE,
  SVG_PATH_QUEUE_SCALE_RATIO,
} from "./lanternDisplay";
import {
  defaultStopLanternTransformFallback,
  SVG_PATH_DEFAULT_STOP,
  SVG_PATH_LANTERN_WIDTH_REM,
} from "../consts/pathLanternLayoutConsts";
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

  it("syncs creation fly progress with list scroll-back toward creation focus", () => {
    expect(creationFlyProgress(0, 0, 1, false)).toBeNull();
    // During 0→-1 scroll-back: fly tracks the same tween as the list.
    expect(creationFlyProgress(CREATION_FOCUS_INDEX, 0, 0, true)).toBe(0);
    expect(creationFlyProgress(CREATION_FOCUS_INDEX, 0, 0.5, true)).toBe(0.5);
    expect(creationFlyProgress(CREATION_FOCUS_INDEX, 0, 1, false)).toBe(1);
    expect(creationFlyProgress(CREATION_FOCUS_INDEX, CREATION_FOCUS_INDEX, 1, false)).toBe(1);
  });

  it("exports default-stop fallback matching authored stop-20 percent pose", () => {
    expect(SVG_PATH_LANTERN_WIDTH_REM).toBe(19);
    const t = defaultStopLanternTransformFallback();
    expect(t.x).toBeCloseTo(SVG_PATH_DEFAULT_STOP.cx / SVG_PATH_DEFAULT_STOP.viewBoxWidth, 6);
    expect(t.y).toBeCloseTo(SVG_PATH_DEFAULT_STOP.cy / SVG_PATH_DEFAULT_STOP.viewBoxHeight, 6);
    expect(t.scale).toBe(1);
    expect(t.opacity).toBe(1);
  });

  it("parks settled creation pose on the default focus stop transform", () => {
    const parsed = {
      viewBox: { width: 100, height: 100 },
      stopsById: {
        20: { cx: 50, cy: 97.2778 },
        21: { cx: 94.098, cy: 68.8194 },
      },
      segmentsByIndex: {},
    } as import("./parseSplitPathSvg").ParsedSplitPathSvg;

    const parked = creationLanternTransformAtFlyT(parsed, 1);
    const def = defaultStopLanternTransform(parsed);
    expect(parked).not.toBeNull();
    expect(def).not.toBeNull();
    expect(parked!.x).toBeCloseTo(def!.x, 6);
    expect(parked!.y).toBeCloseTo(def!.y, 6);
    expect(parked!.scale).toBeCloseTo(def!.scale, 6);
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
