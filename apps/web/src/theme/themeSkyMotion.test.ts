import {
  getSkyMoonOpacity,
  getSkyMotionState,
  themeScaleToUiProgress,
} from "./themeSkyMotion";

describe("getSkyMoonOpacity", () => {
  it("stays fully visible from 0% to 25% UI progress", () => {
    expect(getSkyMoonOpacity(0)).toBe(1);
    expect(getSkyMoonOpacity(25)).toBe(1);
  });

  it("ramps from 1 to 0 between 25% and 75% UI progress", () => {
    expect(getSkyMoonOpacity(50)).toBe(0.5);
    expect(getSkyMoonOpacity(75)).toBe(0);
  });

  it("stays invisible from 75% to 100% UI progress", () => {
    expect(getSkyMoonOpacity(100)).toBe(0);
  });
});

describe("getSkyMotionState", () => {
  it("keeps mountains always visible", () => {
    expect(getSkyMotionState(0).mountain.opacity).toBe(1);
    expect(getSkyMotionState(50).mountain.opacity).toBe(1);
    expect(getSkyMotionState(100).mountain.opacity).toBe(1);
  });

  it("places sun at top with full opacity at day", () => {
    const dayUi = themeScaleToUiProgress(0);
    const motion = getSkyMotionState(0);
    expect(dayUi).toBe(100);
    expect(motion.sun.y).toBe(0);
    expect(motion.sun.opacity).toBe(1);
  });

  it("sets sun below the ridge at dusk", () => {
    const motion = getSkyMotionState(75);
    expect(motion.sun.y).toBeGreaterThan(30);
    expect(motion.sun.opacity).toBe(0);
  });

  it("shows moon at night and hides it during day", () => {
    expect(getSkyMotionState(100).moon.opacity).toBe(1);
    expect(getSkyMotionState(0).moon.opacity).toBe(0);
  });
});
