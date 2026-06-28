import {
  contrastRatio,
  getCelestialLayout,
  getThemeAt,
  mixHexOklab,
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

describe("getThemeAt", () => {
  it("returns contrast-guarded ink and highlight for Bangkok noon", () => {
    const theme = getThemeAt(new Date("2026-06-21T12:00:00+07:00"), BANGKOK);

    expect(theme.paper).toMatch(/^#[0-9A-F]{6}$/);
    expect(contrastRatio(theme.inkOnPaper, theme.paper)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(theme.highlightOnPaper, theme.paper)).toBeGreaterThanOrEqual(4.5);
  });
});

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
