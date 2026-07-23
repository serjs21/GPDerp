/** Full-frame day/night color grade for the scene PNG (no region masks). */
export const DAYLIGHT_BACKGROUND_GRADE = {
  brightnessDay: 1.05,
  brightnessNight: 0.92,
  contrastDay: 1.02,
  contrastNight: 1.08,
  saturateDay: 1.05,
  saturateNight: 0.85,
  softLightOpacityDay: 0.35,
  softLightOpacityNight: 0.55,
  /** Peak multiply opacity at full night (scaled by night factor). */
  multiplyOpacityNight: 0.55,

  /**
   * Photoshop-style color balance casts (0–100%).
   * Each axis is an independent soft-light wash (red / blue / yellow).
   */
  redPercentDay: 0,
  redPercentNight: 10,
  bluePercentDay: 8,
  bluePercentNight: 42,
  yellowPercentDay: 18,
  yellowPercentNight: 6,
  /** Soft-light opacity when a balance axis is at 100%. */
  colorBalanceStrength: 0.4,
} as const;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

export function skyNightFactor(dayFactor: number) {
  return 1 - clamp01(dayFactor);
}

/** Map a 0–100% Photoshop-style balance slider to soft-light opacity. */
export function colorBalanceOpacityFromPercent(percent: number) {
  return (
    (clampPercent(percent) / 100) * DAYLIGHT_BACKGROUND_GRADE.colorBalanceStrength
  );
}

export function backgroundGradeFromDayFactor(dayFactor: number) {
  const t = clamp01(dayFactor);
  const g = DAYLIGHT_BACKGROUND_GRADE;
  const redPercent = lerp(g.redPercentNight, g.redPercentDay, t);
  const bluePercent = lerp(g.bluePercentNight, g.bluePercentDay, t);
  const yellowPercent = lerp(g.yellowPercentNight, g.yellowPercentDay, t);

  return {
    brightness: lerp(g.brightnessNight, g.brightnessDay, t),
    contrast: lerp(g.contrastNight, g.contrastDay, t),
    saturate: lerp(g.saturateNight, g.saturateDay, t),
    softLightOpacity: lerp(g.softLightOpacityNight, g.softLightOpacityDay, t),
    multiplyOpacity: skyNightFactor(dayFactor) * g.multiplyOpacityNight,
    redPercent,
    bluePercent,
    yellowPercent,
    redOpacity: colorBalanceOpacityFromPercent(redPercent),
    blueOpacity: colorBalanceOpacityFromPercent(bluePercent),
    yellowOpacity: colorBalanceOpacityFromPercent(yellowPercent),
  };
}
