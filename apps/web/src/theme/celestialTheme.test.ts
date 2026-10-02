import {
  contrastRatio,
  getCelestialLayout,
  getSceneCssVariables,
  getThemeAt,
  mixHexOklab,
  resolveInkOnSky,
  SKY_INK_DAY,
  type GeoCoordinates,
} from "./celestialTheme";

const BANGKOK: GeoCoordinates = { latitude: 13.7563, longitude: 100.5018 };

describe("mixHexOklab", () => {
  it("returns the start color at progress 0", () => {
    expect(mixHexOklab("#000000", "#FFFFFF", 0)).toBe("#000000");
  });

  it("returns the end color at progress 1", () => {
    expect(mixHexOklab("#000000", "#FFFFFF", 1)).toBe("#FFFFFF");
  });
});

describe("contrastRatio", () => {
  it("returns 1 for identical colors", () => {
    expect(contrastRatio("#FFFFFF", "#FFFFFF")).toBeCloseTo(1, 5);
  });

  it("returns at least 21 for black on white", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeGreaterThanOrEqual(21);
  });
});

describe("resolveInkOnSky", () => {
  it("prefers dark blue against a bright day sky mid", () => {
    const ink = resolveInkOnSky("#B8C7D3", "#F7F0D8");
    expect(contrastRatio(ink, "#B8C7D3")).toBeGreaterThanOrEqual(4.5);
    // Day preference should land near navy (darker than mid-gray).
    expect(ink.toLowerCase()).toBe(SKY_INK_DAY.toLowerCase());
  });

  it("prefers moon yellow against a dark night sky mid", () => {
    const moon = "#FFF1CD";
    const ink = resolveInkOnSky("#312B4A", moon);
    expect(contrastRatio(ink, "#312B4A")).toBeGreaterThanOrEqual(4.5);
    expect(ink.toLowerCase()).toBe(moon.toLowerCase());
  });
});

describe("getThemeAt", () => {
  it("returns contrast-guarded ink and highlight for Bangkok noon", () => {
    const theme = getThemeAt(new Date("2026-06-21T12:00:00+07:00"), BANGKOK);

    expect(theme.paper).toMatch(/^#[0-9A-F]{6}$/i);
    expect(contrastRatio(theme.inkOnPaper, theme.paper)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(theme.highlightOnPaper, theme.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(theme.inkOnSky, theme.skyMid)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(theme.highlightOnSky, theme.skyTop)).toBeGreaterThanOrEqual(4.5);
    // Noon sky should drive ink toward dark blue (low luminance).
    expect(relativeChannelSum(theme.inkOnSky)).toBeLessThan(relativeChannelSum(theme.moon));
  });

  it("returns moon-yellowish inkOnSky for Bangkok midnight", () => {
    const theme = getThemeAt(new Date("2026-06-21T00:00:00+07:00"), BANGKOK);

    expect(contrastRatio(theme.inkOnSky, theme.skyMid)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(theme.highlightOnSky, theme.skyTop)).toBeGreaterThanOrEqual(4.5);
    // Midnight sky should drive ink toward moon yellow (high luminance).
    expect(relativeChannelSum(theme.inkOnSky)).toBeGreaterThan(relativeChannelSum(SKY_INK_DAY));
  });
});

function relativeChannelSum(hex: string): number {
  const normalized = hex.replace("#", "");
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return r + g + b;
}

describe("getCelestialLayout", () => {
  it("keeps sun and moon within padded percentage bounds", () => {
    const layout = getCelestialLayout(new Date("2026-06-21T18:00:00+07:00"), BANGKOK, {
      cameraAzimuthDeg: 180,
      mirrorScene: true,
      horizonY: 82,
      zenithY: 10,
      horizontalPadding: 5,
    });

    expect(layout.sun.x).toBeGreaterThanOrEqual(5);
    expect(layout.sun.x).toBeLessThanOrEqual(95);
    expect(layout.sun.y).toBeGreaterThanOrEqual(10);
    expect(layout.sun.y).toBeLessThanOrEqual(82);
    expect(layout.moon.x).toBeGreaterThanOrEqual(5);
    expect(layout.moon.x).toBeLessThanOrEqual(95);
    expect(layout.moon.opacity).toBeGreaterThanOrEqual(0);
    expect(layout.moon.opacity).toBeLessThanOrEqual(1);
  });
});

describe("getSceneCssVariables", () => {
  it("formats layout numbers with stable precision for hydration", () => {
    const date = new Date("2023-03-15T22:00:00+07:00");
    const theme = getThemeAt(date, BANGKOK);
    const layout = getCelestialLayout(date, BANGKOK, {
      cameraAzimuthDeg: 180,
      mirrorScene: true,
      horizonY: 82,
      zenithY: 10,
      horizontalPadding: 5,
    });
    const sceneVars = getSceneCssVariables(theme, layout);

    expect(sceneVars["--moon-x"]).toMatch(/^-?\d+(\.\d{1,4})?%$/);
    expect(sceneVars["--sun-x"]).toMatch(/^-?\d+(\.\d{1,4})?%$/);
    expect(sceneVars["--moon-limb-angle"]).toMatch(/^-?\d+(\.\d{1,4})?deg$/);
    expect(sceneVars["--moon-opacity"]).toMatch(/^-?\d+(\.\d{1,4})?$/);
    expect(sceneVars["--ink-on-sky"]).toBe(theme.inkOnSky);
  });
});
