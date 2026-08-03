import { mixHexOklab } from "@/theme/celestialTheme";
import {
  cycleDirectionFromSlot,
  geographicMaskLayersFromTheme,
  getBackgroundCycleState,
  themeSkyGradient,
} from "./daylightBackgroundCycle";
import { DAYLIGHT_BACKGROUND_MASK_STRENGTH } from "./daylightBackgroundMaskStrength.config";

const sampleTheme = {
  skyTop: "#4A7BC8",
  skyMid: "#8BB4E8",
  skyHorizon: "#F2A07A",
} as const;

describe("daylightBackgroundCycle", () => {
  it("desaturates at noon", () => {
    const noon = getBackgroundCycleState(55, "rising");
    expect(noon.saturation).toBeCloseTo(1, 1);
    expect(noon.brightness).toBeGreaterThan(0.9);
  });

  it("darkens and desaturates at full night", () => {
    const night = getBackgroundCycleState(-18, "rising");
    expect(night.brightness).toBeCloseTo(0.7, 1);
    expect(night.saturation).toBeLessThan(0.8);
    expect(night.starsOpacity).toBe(1);
  });

  it("derives dial direction from slot", () => {
    expect(cycleDirectionFromSlot(24)).toBe("rising");
    expect(cycleDirectionFromSlot(72)).toBe("setting");
  });

  it("builds the CelestialScene sky gradient from theme tokens", () => {
    expect(themeSkyGradient(sampleTheme)).toBe(
      "linear-gradient(180deg, #4A7BC8 0%, #8BB4E8 54%, #F2A07A 100%)",
    );
  });

  it("mixes neutral anchors with a subtle theme tint", () => {
    const layers = geographicMaskLayersFromTheme(sampleTheme);
    const {
      mountainAnchor,
      midgroundAnchor,
      foregroundAnchor,
      mountainThemeMix,
      midgroundThemeMix,
      foregroundThemeMix,
    } = DAYLIGHT_BACKGROUND_MASK_STRENGTH;

    expect(layers.mountain.color).toBe(
      mixHexOklab(mountainAnchor, sampleTheme.skyMid, mountainThemeMix),
    );
    expect(layers.mountain.color).not.toBe(sampleTheme.skyMid);
    expect(layers.mountain.blendMode).toBe("soft-light");

    expect(layers.midground.color).toBe(
      mixHexOklab(midgroundAnchor, sampleTheme.skyHorizon, midgroundThemeMix),
    );
    expect(layers.midground.color).not.toBe(sampleTheme.skyHorizon);
    expect(layers.midground.blendMode).toBe("soft-light");

    expect(layers.foreground.color).toBe(
      mixHexOklab(foregroundAnchor, sampleTheme.skyHorizon, foregroundThemeMix),
    );
    expect(layers.foreground.color).not.toBe(sampleTheme.skyHorizon);
    expect(layers.foreground.blendMode).toBe("multiply");
  });

  it("keeps geographic opacity floors at noon and boosts at night", () => {
    const noon = getBackgroundCycleState(55, "rising");
    const night = getBackgroundCycleState(-18, "rising");
    const {
      mountainMinOpacity,
      midgroundMinOpacity,
      foregroundMinOpacity,
      nightOpacityBoost,
    } = DAYLIGHT_BACKGROUND_MASK_STRENGTH;

    const dayLayers = geographicMaskLayersFromTheme(sampleTheme, noon);
    expect(dayLayers.mountain.opacity).toBeCloseTo(mountainMinOpacity);
    expect(dayLayers.midground.opacity).toBeCloseTo(midgroundMinOpacity);
    expect(dayLayers.foreground.opacity).toBeCloseTo(foregroundMinOpacity);

    const nightLayers = geographicMaskLayersFromTheme(sampleTheme, night);
    expect(nightLayers.mountain.opacity).toBeCloseTo(
      mountainMinOpacity + nightOpacityBoost,
    );
    expect(nightLayers.midground.opacity).toBeCloseTo(
      midgroundMinOpacity + nightOpacityBoost,
    );
    expect(nightLayers.foreground.opacity).toBeCloseTo(
      foregroundMinOpacity + nightOpacityBoost,
    );
  });
});
