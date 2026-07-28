import type { CSSProperties } from "react";

export type CycleDirection = "rising" | "setting";

export type PaletteDirection = CycleDirection | "either";

export type MaskBlendMode = NonNullable<CSSProperties["mixBlendMode"]>;

export type MaskRegionKeyframe = readonly [color: string, opacity: number, blendMode: MaskBlendMode];

export type DaylightPaletteKeyframe = {
  solarElevation: number;
  direction: PaletteDirection;
  horizon: MaskRegionKeyframe;
  mountain: MaskRegionKeyframe;
  midground: MaskRegionKeyframe;
  foreground: MaskRegionKeyframe;
  exposure: number;
  saturation: number;
  starsOpacity: number;
};

/** Geographic mask tints keyed by solar elevation (from local day-cycle references). */
export const DAYLIGHT_BACKGROUND_PALETTES: DaylightPaletteKeyframe[] = [
  {
    solarElevation: -18,
    direction: "either",
    horizon: ["#516B92", 0.1, "screen"],
    mountain: ["#17243A", 0.52, "multiply"],
    midground: ["#19263B", 0.48, "multiply"],
    foreground: ["#080F1B", 0.62, "multiply"],
    exposure: -0.42,
    saturation: 0.72,
    starsOpacity: 1,
  },
  {
    solarElevation: -12,
    direction: "either",
    horizon: ["#746D8D", 0.12, "screen"],
    mountain: ["#29334D", 0.44, "multiply"],
    midground: ["#30364B", 0.39, "multiply"],
    foreground: ["#141A29", 0.52, "multiply"],
    exposure: -0.3,
    saturation: 0.78,
    starsOpacity: 0.78,
  },
  {
    solarElevation: -6,
    direction: "rising",
    horizon: ["#D49A91", 0.17, "screen"],
    mountain: ["#4B506B", 0.33, "multiply"],
    midground: ["#5A5367", 0.24, "soft-light"],
    foreground: ["#292C3D", 0.42, "multiply"],
    exposure: -0.18,
    saturation: 0.84,
    starsOpacity: 0.42,
  },
  {
    solarElevation: 0,
    direction: "rising",
    horizon: ["#FFD0A7", 0.24, "screen"],
    mountain: ["#77768A", 0.23, "soft-light"],
    midground: ["#987A7D", 0.18, "soft-light"],
    foreground: ["#504A55", 0.27, "multiply"],
    exposure: -0.06,
    saturation: 0.9,
    starsOpacity: 0.08,
  },
  {
    solarElevation: 8,
    direction: "rising",
    horizon: ["#FFE2BD", 0.3, "screen"],
    mountain: ["#A197A9", 0.17, "soft-light"],
    midground: ["#C9A29A", 0.15, "soft-light"],
    foreground: ["#79685F", 0.13, "soft-light"],
    exposure: 0.03,
    saturation: 0.95,
    starsOpacity: 0,
  },
  {
    solarElevation: 35,
    direction: "rising",
    horizon: ["#FFF1D9", 0.15, "screen"],
    mountain: ["#A5B7C4", 0.1, "soft-light"],
    midground: ["#E6D8CA", 0.07, "soft-light"],
    foreground: ["#C1B298", 0.05, "soft-light"],
    exposure: 0.08,
    saturation: 1,
    starsOpacity: 0,
  },
  {
    solarElevation: 55,
    direction: "either",
    horizon: ["#F4F1E8", 0.1, "screen"],
    mountain: ["#9FB4C2", 0.08, "soft-light"],
    midground: ["#D9D8C8", 0.04, "soft-light"],
    foreground: ["#B8B09B", 0.04, "soft-light"],
    exposure: 0.1,
    saturation: 1,
    starsOpacity: 0,
  },
  {
    solarElevation: 8,
    direction: "setting",
    horizon: ["#FFD19A", 0.32, "screen"],
    mountain: ["#987E89", 0.23, "soft-light"],
    midground: ["#C78C78", 0.2, "soft-light"],
    foreground: ["#765B50", 0.16, "multiply"],
    exposure: 0,
    saturation: 1.04,
    starsOpacity: 0,
  },
  {
    solarElevation: 0,
    direction: "setting",
    horizon: ["#F5A476", 0.27, "screen"],
    mountain: ["#5C5069", 0.29, "multiply"],
    midground: ["#795667", 0.24, "soft-light"],
    foreground: ["#2C2939", 0.39, "multiply"],
    exposure: -0.14,
    saturation: 0.94,
    starsOpacity: 0.08,
  },
  {
    solarElevation: -6,
    direction: "setting",
    horizon: ["#B16B78", 0.15, "screen"],
    mountain: ["#333A54", 0.4, "multiply"],
    midground: ["#463B50", 0.35, "multiply"],
    foreground: ["#151A28", 0.51, "multiply"],
    exposure: -0.28,
    saturation: 0.82,
    starsOpacity: 0.42,
  },
];
