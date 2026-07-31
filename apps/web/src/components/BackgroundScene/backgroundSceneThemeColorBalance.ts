import { THEME_STOPS, type ThemeColors } from "@/theme/celestialTheme";
import {
  DEFAULT_COLOR_BALANCE,
  normalizeColorBalance,
  type ColorBalanceValues,
} from "./backgroundSceneColorBalance";
import { BACKGROUND_SCENE_THEME_COLOR_BALANCE } from "./backgroundSceneThemeColorBalance.config";

export type ThemeColorBalanceInput = {
  theme: Pick<ThemeColors, "skyHorizon" | "moon">;
  solarElevationDeg: number;
};

export type ThemeColorBalanceResult = {
  global: ColorBalanceValues;
  mountain: ColorBalanceValues;
};

type Rgb = [number, number, number];

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const smoothstep = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

function hexToSrgb(hex: string): Rgb {
  const normalized = hex.replace("#", "");
  return [0, 2, 4].map((offset) =>
    Number.parseInt(normalized.slice(offset, offset + 2), 16) / 255,
  ) as Rgb;
}

function blendRgb(a: Rgb, b: Rgb, weightB: number): Rgb {
  const weightA = 1 - weightB;
  return [
    a[0] * weightA + b[0] * weightB,
    a[1] * weightA + b[1] * weightB,
    a[2] * weightA + b[2] * weightB,
  ];
}

function scaleBalance(values: ColorBalanceValues, scale: number): ColorBalanceValues {
  return normalizeColorBalance({
    cyanRed: values.cyanRed * scale,
    magentaGreen: values.magentaGreen * scale,
    yellowBlue: values.yellowBlue * scale,
  });
}

function addBalance(
  left: ColorBalanceValues,
  right: ColorBalanceValues,
): ColorBalanceValues {
  return normalizeColorBalance({
    cyanRed: left.cyanRed + right.cyanRed,
    magentaGreen: left.magentaGreen + right.magentaGreen,
    yellowBlue: left.yellowBlue + right.yellowBlue,
  });
}

function lerpBalance(
  from: ColorBalanceValues,
  to: ColorBalanceValues,
  progress: number,
): ColorBalanceValues {
  const t = clamp01(progress);
  return normalizeColorBalance({
    cyanRed: lerp(from.cyanRed, to.cyanRed, t),
    magentaGreen: lerp(from.magentaGreen, to.magentaGreen, t),
    yellowBlue: lerp(from.yellowBlue, to.yellowBlue, t),
  });
}

function nightStrength(solarElevationDeg: number): number {
  const { nightElevationStart, nightElevationEnd } = BACKGROUND_SCENE_THEME_COLOR_BALANCE;
  if (solarElevationDeg >= nightElevationStart) return 0;
  if (solarElevationDeg <= nightElevationEnd) return 1;
  return smoothstep(
    (nightElevationStart - solarElevationDeg) /
      (nightElevationStart - nightElevationEnd),
  );
}

function dayStrength(solarElevationDeg: number): number {
  const { dayElevationFull } = BACKGROUND_SCENE_THEME_COLOR_BALANCE;
  if (solarElevationDeg >= dayElevationFull) return 1;
  if (solarElevationDeg <= 0) return 0;
  return smoothstep(solarElevationDeg / dayElevationFull);
}

function sampleGlobalLighting(theme: Pick<ThemeColors, "skyHorizon" | "moon">): Rgb {
  const { moonSampleWeight } = BACKGROUND_SCENE_THEME_COLOR_BALANCE;
  return blendRgb(
    hexToSrgb(theme.skyHorizon),
    hexToSrgb(theme.moon),
    moonSampleWeight,
  );
}

function themeDeltaBalance(theme: Pick<ThemeColors, "skyHorizon" | "moon">): ColorBalanceValues {
  const { rgbToSliderGain } = BACKGROUND_SCENE_THEME_COLOR_BALANCE;
  const noon = sampleGlobalLighting(THEME_STOPS.day);
  const current = sampleGlobalLighting(theme);
  const delta: Rgb = [
    current[0] - noon[0],
    current[1] - noon[1],
    current[2] - noon[2],
  ];

  return normalizeColorBalance({
    cyanRed: delta[0] * rgbToSliderGain,
    magentaGreen: delta[1] * rgbToSliderGain,
    yellowBlue: delta[2] * rgbToSliderGain,
  });
}

function clampNightGlobal(values: ColorBalanceValues): ColorBalanceValues {
  const { nightGlobalCaps } = BACKGROUND_SCENE_THEME_COLOR_BALANCE;
  return normalizeColorBalance({
    cyanRed: Math.max(nightGlobalCaps.cyanRed, values.cyanRed),
    magentaGreen: Math.max(nightGlobalCaps.magentaGreen, values.magentaGreen),
    yellowBlue: Math.max(nightGlobalCaps.yellowBlue, values.yellowBlue),
  });
}

/** Derive global + mountain color balance from theme selection (noon = neutral). */
export function colorBalanceFromThemeSelection({
  theme,
  solarElevationDeg,
}: ThemeColorBalanceInput): ThemeColorBalanceResult {
  const nightT = nightStrength(solarElevationDeg);
  const dayT = dayStrength(solarElevationDeg);
  const twilightT = 1 - nightT;

  const {
    nightGlobalTarget,
    mountainNightExtra,
  } = BACKGROUND_SCENE_THEME_COLOR_BALANCE;

  const fromTheme = scaleBalance(
    themeDeltaBalance(theme),
    twilightT * 0.85 + dayT * 0.15,
  );

  const global = clampNightGlobal(
    lerpBalance(fromTheme, nightGlobalTarget, nightT),
  );

  const mountain = addBalance(
    global,
    scaleBalance(mountainNightExtra, nightT),
  );

  const delta = themeDeltaBalance(theme);
  const nearNoon =
    nightT === 0 &&
    Math.abs(delta.cyanRed) < 2 &&
    Math.abs(delta.magentaGreen) < 2 &&
    Math.abs(delta.yellowBlue) < 2;

  if (nearNoon) {
    return {
      global: DEFAULT_COLOR_BALANCE,
      mountain: DEFAULT_COLOR_BALANCE,
    };
  }

  return { global, mountain };
}
