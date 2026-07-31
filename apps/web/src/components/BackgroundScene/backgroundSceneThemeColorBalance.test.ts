import { THEME_STOPS } from "@/theme/celestialTheme";
import { colorBalanceFromThemeSelection } from "./backgroundSceneThemeColorBalance";

describe("colorBalanceFromThemeSelection", () => {
  it("returns neutral balance at midday reference theme and elevation", () => {
    const result = colorBalanceFromThemeSelection({
      theme: THEME_STOPS.day,
      solarElevationDeg: 55,
    });

    expect(result.global).toEqual({ cyanRed: 0, magentaGreen: 0, yellowBlue: 0 });
    expect(result.mountain).toEqual({ cyanRed: 0, magentaGreen: 0, yellowBlue: 0 });
  });

  it("shifts global balance cool at night without crushing darkness", () => {
    const result = colorBalanceFromThemeSelection({
      theme: THEME_STOPS.night,
      solarElevationDeg: -15,
    });

    expect(result.global.yellowBlue).toBeLessThan(0);
    expect(result.global.yellowBlue).toBeGreaterThanOrEqual(-35);
    expect(result.global.cyanRed).toBeGreaterThanOrEqual(-18);
  });

  it("keeps mountain darker and cooler than global at night", () => {
    const result = colorBalanceFromThemeSelection({
      theme: THEME_STOPS.night,
      solarElevationDeg: -15,
    });

    expect(result.mountain.yellowBlue).toBeLessThan(result.global.yellowBlue);
    expect(result.mountain.cyanRed).toBeLessThan(result.global.cyanRed);
  });

  it("applies warm shift at sunrise theme", () => {
    const result = colorBalanceFromThemeSelection({
      theme: THEME_STOPS.sunrise,
      solarElevationDeg: 2,
    });

    expect(result.global.cyanRed).toBeGreaterThan(0);
  });
});
