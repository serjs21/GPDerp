import {
  getSkyGradientCss,
  mixHexOklab,
  type ThemeColors,
} from "@/theme/celestialTheme";
import {
  DAYLIGHT_BACKGROUND_PALETTES,
  type CycleDirection,
  type DaylightPaletteKeyframe,
  type MaskBlendMode,
} from "./daylightBackgroundPalettes.config";
import { DAYLIGHT_BACKGROUND_MASK_STRENGTH } from "./daylightBackgroundMaskStrength.config";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

const smoothstep = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

export type BackgroundCycleState = {
  exposure: number;
  brightness: number;
  saturation: number;
  starsOpacity: number;
};

export type GeographicMaskLayer = {
  color: string;
  opacity: number;
  blendMode: MaskBlendMode;
};

export type GeographicMaskLayers = {
  mountain: GeographicMaskLayer;
  midground: GeographicMaskLayer;
  foreground: GeographicMaskLayer;
};

/** Same vertical gradient as CelestialScene letterbox sky. */
export function themeSkyGradient(
  theme: Pick<ThemeColors, "skyTop" | "skyMid" | "skyHorizon">,
) {
  return getSkyGradientCss(theme);
}

function geographicOpacity(
  minOpacity: number,
  nightOpacityBoost: number,
  starsOpacity = 0,
) {
  return Math.min(1, minOpacity + nightOpacityBoost * starsOpacity);
}

export function geographicMaskLayersFromTheme(
  theme: Pick<ThemeColors, "skyMid" | "skyHorizon">,
  cycle?: BackgroundCycleState,
  config = DAYLIGHT_BACKGROUND_MASK_STRENGTH,
): GeographicMaskLayers {
  const {
    mountainAnchor,
    midgroundAnchor,
    foregroundAnchor,
    mountainThemeMix,
    midgroundThemeMix,
    foregroundThemeMix,
    mountainMinOpacity,
    midgroundMinOpacity,
    foregroundMinOpacity,
    nightOpacityBoost,
  } = config;
  const starsOpacity = cycle?.starsOpacity ?? 0;

  return {
    mountain: {
      color: mixHexOklab(mountainAnchor, theme.skyMid, mountainThemeMix),
      opacity: geographicOpacity(
        mountainMinOpacity,
        nightOpacityBoost,
        starsOpacity,
      ),
      blendMode: "soft-light",
    },
    midground: {
      color: mixHexOklab(midgroundAnchor, theme.skyHorizon, midgroundThemeMix),
      opacity: geographicOpacity(
        midgroundMinOpacity,
        nightOpacityBoost,
        starsOpacity,
      ),
      blendMode: "soft-light",
    },
    foreground: {
      color: mixHexOklab(foregroundAnchor, theme.skyHorizon, foregroundThemeMix),
      opacity: geographicOpacity(
        foregroundMinOpacity,
        nightOpacityBoost,
        starsOpacity,
      ),
      blendMode: "multiply",
    },
  };
}

function paletteTrack(direction: CycleDirection) {
  return DAYLIGHT_BACKGROUND_PALETTES.filter(
    (keyframe) => keyframe.direction === "either" || keyframe.direction === direction,
  ).sort((a, b) => a.solarElevation - b.solarElevation);
}

function findBounds(
  track: DaylightPaletteKeyframe[],
  elevation: number,
): [DaylightPaletteKeyframe, DaylightPaletteKeyframe] {
  if (!track.length) {
    throw new Error("Palette track is empty");
  }
  if (elevation <= track[0].solarElevation) {
    return [track[0], track[0]];
  }
  const last = track[track.length - 1];
  if (elevation >= last.solarElevation) {
    return [last, last];
  }

  for (let i = 0; i < track.length - 1; i++) {
    const left = track[i];
    const right = track[i + 1];
    if (elevation >= left.solarElevation && elevation <= right.solarElevation) {
      return [left, right];
    }
  }

  return [last, last];
}

function interpolateKeyframe(
  left: DaylightPaletteKeyframe,
  right: DaylightPaletteKeyframe,
  t: number,
): BackgroundCycleState {
  const exposure = lerp(left.exposure, right.exposure, t);
  return {
    exposure,
    brightness: Math.max(0.7, 1 + exposure),
    saturation: lerp(left.saturation, right.saturation, t),
    starsOpacity: lerp(left.starsOpacity, right.starsOpacity, t),
  };
}

export function getBackgroundCycleState(
  solarElevationDeg: number,
  direction: CycleDirection,
): BackgroundCycleState {
  const track = paletteTrack(direction);
  const [left, right] = findBounds(track, solarElevationDeg);
  if (left === right) {
    return interpolateKeyframe(left, right, 0);
  }

  const span = Math.max(1, right.solarElevation - left.solarElevation);
  const rawT = (solarElevationDeg - left.solarElevation) / span;
  return interpolateKeyframe(left, right, smoothstep(rawT));
}

/** Map theme scale progress (0 = day, 100 = night) to solar elevation. */
export function solarElevationFromScaleProgress(progress: number) {
  const t = clamp01(progress / 100);
  return lerp(55, -18, t);
}

/** Map scale progress to a pseudo slot for continuous theme interpolation. */
export function slotFromScaleProgress(progress: number) {
  const t = clamp01(progress / 100);
  return Math.round(lerp(48, 0, t));
}

export function cycleDirectionFromScaleProgress(progress: number): CycleDirection {
  return progress < 50 ? "rising" : "setting";
}

export function cycleDirectionFromSlot(slot: number): CycleDirection {
  return slot < 48 ? "rising" : "setting";
}
