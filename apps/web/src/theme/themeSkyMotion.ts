/** Pure motion math for theme sky elements (icons + DaylightBackground). */

export type SkyMotionState = {
  moon: { x: number; y: number; scale: number; opacity: number };
  sun: { x: number; y: number; scale: number; opacity: number };
  mountain: { opacity: number };
  clouds: { driftX: number; opacity: number };
};

const MOON_FADE_START = 20;
const MOON_HIDE_AT = 45;
const SUN_APPEAR_AT = 55;
const SUN_MAX_SCALE_AT = 80;
const MOON_OPACITY_FADE_START = 20;
const MOON_OPACITY_HIDE_AT = 45;
const SUN_OPACITY_SHOW_AT = 55;
const SUN_OPACITY_FULL_AT = 80;
const MOUNTAIN_VISIBLE_FROM = 15;
const MOUNTAIN_VISIBLE_TO = 85;
const EDGE_CENTER_WINDOW = 20;

const ICON_CORNER_OFFSET_PX = (16 - 4) / Math.SQRT2;
const SKY_CORNER_OFFSET_VW = 18;
const SKY_CENTER_OFFSET_VW = 8;

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const lerp = (from: number, to: number, t: number) => from + (to - from) * clamp01(t);

export const easeInOut = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
};

export const phaseBetween = (value: number, start: number, end: number) => {
  if (value <= start) return 0;
  if (value >= end) return 1;
  return (value - start) / (end - start);
};

/** Convert canonical theme scale (0=day, 100=night) to UI slider progress. */
export const themeScaleToUiProgress = (themeScaleProgress: number) =>
  Math.max(0, Math.min(100, 100 - themeScaleProgress));

/** Convert UI slider progress to canonical theme scale. */
export const uiProgressToThemeScale = (uiProgress: number) =>
  Math.max(0, Math.min(100, 100 - uiProgress));

export const getIconMotionState = (uiProgress: number) => {
  const moonFadeProgress = phaseBetween(uiProgress, MOON_FADE_START, MOON_HIDE_AT);
  const moonPhase = 1 - moonFadeProgress;
  const mountainVisible = uiProgress >= MOUNTAIN_VISIBLE_FROM && uiProgress <= MOUNTAIN_VISIBLE_TO;
  const sunPhase = phaseBetween(uiProgress, SUN_APPEAR_AT, SUN_MAX_SCALE_AT);

  const moonEdgeCenter = easeInOut(clamp01(1 - uiProgress / EDGE_CENTER_WINDOW));
  const sunEdgeCenter = easeInOut(
    clamp01((uiProgress - (100 - EDGE_CENTER_WINDOW)) / EDGE_CENTER_WINDOW),
  );

  return {
    moon: {
      x: lerp(-ICON_CORNER_OFFSET_PX, 0, moonEdgeCenter),
      y: lerp(-ICON_CORNER_OFFSET_PX, 0, moonEdgeCenter),
      scale: 0.66 + moonPhase * 0.34,
      opacity: 1 - phaseBetween(uiProgress, MOON_OPACITY_FADE_START, MOON_OPACITY_HIDE_AT),
    },
    sun: {
      x: lerp(ICON_CORNER_OFFSET_PX, 0, sunEdgeCenter),
      y: lerp(-ICON_CORNER_OFFSET_PX, 0, sunEdgeCenter),
      scale: 0.7 + sunPhase * 0.3,
      opacity: phaseBetween(uiProgress, SUN_OPACITY_SHOW_AT, SUN_OPACITY_FULL_AT),
    },
    mountain: { opacity: mountainVisible ? 1 : 0 },
  };
};

export const getSkyMotionState = (themeScaleProgress: number): SkyMotionState => {
  const uiProgress = themeScaleToUiProgress(themeScaleProgress);
  const icon = getIconMotionState(uiProgress);

  const moonEdgeCenter = easeInOut(clamp01(1 - uiProgress / EDGE_CENTER_WINDOW));
  const sunEdgeCenter = easeInOut(
    clamp01((uiProgress - (100 - EDGE_CENTER_WINDOW)) / EDGE_CENTER_WINDOW),
  );

  const moonX = lerp(-SKY_CORNER_OFFSET_VW, SKY_CENTER_OFFSET_VW, moonEdgeCenter);
  const sunX = lerp(SKY_CORNER_OFFSET_VW, -SKY_CENTER_OFFSET_VW, sunEdgeCenter);
  const cloudDrift = lerp(-4, 4, themeScaleProgress / 100);

  return {
    moon: {
      x: moonX,
      y: lerp(-12, 4, moonEdgeCenter),
      scale: icon.moon.scale,
      opacity: icon.moon.opacity,
    },
    sun: {
      x: sunX,
      y: lerp(-14, 2, sunEdgeCenter),
      scale: icon.sun.scale,
      opacity: icon.sun.opacity,
    },
    mountain: icon.mountain,
    clouds: {
      driftX: cloudDrift,
      opacity: lerp(0.55, 0.35, themeScaleProgress / 100),
    },
  };
};
