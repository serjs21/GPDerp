import type { HaikuDto } from "@/api/haikus";
import {
  clampFocusIndex,
  computeVisibleLanterns,
  isPathStopVisible,
} from "./computeVisibleLanterns";
import { LANTERN_PATH_FOCUS_STOP } from "./lanternPath.config";
import { pathStopForHaikuIndex } from "./resolveLanternAtPathStop";

const makeHaiku = (id: string): HaikuDto => ({
  id,
  title: `Title ${id}`,
  titleSuffix: 0,
  body: "body",
  createdAt: "2026-01-01T00:00:00.000Z",
  accountId: "a",
  createdById: "u",
  labels: [],
});

describe("computeVisibleLanterns", () => {
  const haikus = Array.from({ length: 20 }, (_, index) => makeHaiku(String(index)));

  it("shows focus at stop-1 and up to 15 followers on the path", () => {
    const visible = computeVisibleLanterns(haikus, 0, 1);
    expect(visible).toHaveLength(16);
    expect(visible[0]?.pathStop).toBeCloseTo(LANTERN_PATH_FOCUS_STOP, 5);
    expect(visible.at(-1)?.pathStop).toBeCloseTo(16, 5);
  });

  it("includes one predecessor at stop-0 when focus is not first", () => {
    const visible = computeVisibleLanterns(haikus, 3, 1);
    const predecessor = visible.find((entry) => entry.haikuIndex === 2);
    expect(predecessor?.pathStop).toBeCloseTo(0, 5);
  });

  it("hides haikus outside the window", () => {
    const visible = computeVisibleLanterns(haikus, 0, 1);
    expect(visible.some((entry) => entry.haikuIndex === 17)).toBe(false);
  });

  it("interpolates path stops during tween", () => {
    const visible = computeVisibleLanterns(haikus, 1, 0.5, 0);
    const focus = visible.find((entry) => entry.haikuIndex === 1);
    expect(focus?.pathStop).toBeCloseTo(1.5, 5);
  });

  it("clamps focus index to list bounds", () => {
    expect(clampFocusIndex(-2, 5)).toBe(0);
    expect(clampFocusIndex(99, 5)).toBe(4);
  });
});

describe("pathStopForHaikuIndex", () => {
  it("maps focus haiku to stop-1", () => {
    expect(pathStopForHaikuIndex(4, 4)).toBe(LANTERN_PATH_FOCUS_STOP);
  });
});

describe("isPathStopVisible", () => {
  it("accepts virtual stop -1 through stop 16", () => {
    expect(isPathStopVisible(-1)).toBe(true);
    expect(isPathStopVisible(16)).toBe(true);
    expect(isPathStopVisible(-2)).toBe(false);
    expect(isPathStopVisible(17)).toBe(false);
  });
});
