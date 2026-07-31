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

  it("matches tuned night global and mountain balance at full night", () => {
    const result = colorBalanceFromThemeSelection({
      theme: THEME_STOPS.night,
      solarElevationDeg: -15,
    });

    expect(result.global).toEqual({ cyanRed: -6, magentaGreen: 0, yellowBlue: 29 });
    expect(result.mountain).toEqual({ cyanRed: -52, magentaGreen: -38, yellowBlue: -8 });
  });

  it("keeps mountain darker than global at night", () => {
    const result = colorBalanceFromThemeSelection({
      theme: THEME_STOPS.night,
      solarElevationDeg: -15,
    });

    expect(result.mountain.cyanRed).toBeLessThan(result.global.cyanRed);
    expect(result.mountain.magentaGreen).toBeLessThan(result.global.magentaGreen);
  });

  it("applies warm shift at sunrise theme", () => {
    const result = colorBalanceFromThemeSelection({
      theme: THEME_STOPS.sunrise,
      solarElevationDeg: 2,
    });

    expect(result.global.cyanRed).toBeGreaterThan(0);
  });
});
