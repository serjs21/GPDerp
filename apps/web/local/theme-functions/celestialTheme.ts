/**
 * Celestial theme engine for the haiku scene.
 *
 * Dependency:
 *   npm i suncalc
 *
 * Requires SunCalc v2+. SunCalc positions use degrees:
 * - altitude: 0 at the horizon, 90 at zenith
 * - azimuth: 0 at north, 90 at east, 180 at south, 270 at west
 *
 * Pass an absolute Date representing the selected instant. The caller is
 * responsible for creating the Date in the intended location/time-zone.
 */

import * as SunCalc from "suncalc";

export type ThemePhase =
  | "night"
  | "preDawn"
  | "blueDawn"
  | "sunrise"
  | "day"
  | "golden"
  | "sunset"
  | "blueNight";

export type ThemeToken =
  | "skyTop"
  | "skyMid"
  | "skyHorizon"
  | "paper"
  | "ink"
  | "highlight"
  | "sun"
  | "moon";

export type ThemeColors = Record<ThemeToken, string> & {
  /** Accessible text color for use on the note/card background. */
  inkOnPaper: string;
  /** Accessible accent color for use on the note/card background. */
  highlightOnPaper: string;
};

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export interface CelestialProjectionOptions {
  /**
   * SunCalc measures azimuth clockwise from north. 180 means the scene camera is looking south.
   * Use 90 to frame east, 270 to frame west, etc.
   */
  cameraAzimuthDeg?: number;
  /** Flip east/west to match a purely artistic composition. */
  mirrorScene?: boolean;
  /** Scene Y coordinate for the horizon, expressed as a percentage. */
  horizonY?: number;
  /** Topmost allowed scene Y coordinate for a body at zenith. */
  zenithY?: number;
  /** Horizontal scene padding in percentage points. */
  horizontalPadding?: number;
}

export interface ProjectedCelestialBody {
  /** Percentage coordinate. Use as `left: ${x}%`. */
  x: number;
  /** Percentage coordinate. Use as `top: ${y}%`. */
  y: number;
  /** 0–1, including a soft fade near the horizon. */
  opacity: number;
  /** True while the object is inside the camera's horizontal field of view. */
  isWithinView: boolean;
  /** True when the body's mathematical altitude is at or above the horizon. */
  isAboveHorizon: boolean;
}

export interface CelestialLayout {
  sun: ProjectedCelestialBody & {
    altitudeDeg: number;
    azimuthDeg: number;
  };
  moon: ProjectedCelestialBody & {
    altitudeDeg: number;
    azimuthDeg: number;
    illumination: number;
    phase: number;
    waxing: boolean;
    /** Rotate a CSS/SVG moon mask by this number of degrees. */
    limbAngleDeg: number;
  };
}

export interface StaticOverlayConfig {
  /**
   * Placeholder: set this to e.g. "/textures/washi-paper-noise.webp".
   * Keep it `null` until an overlay asset exists.
   */
  src: string | null;
  opacity: number;
  blendMode:
    | "normal"
    | "multiply"
    | "screen"
    | "overlay"
    | "soft-light"
    | "hard-light";
  size: "cover" | "contain" | "auto" | `${number}%`;
  position: string;
  repeat: "repeat" | "repeat-x" | "repeat-y" | "no-repeat";
}

export const STATIC_OVERLAY: StaticOverlayConfig = {
  // TODO: replace `null` with the final transparent watercolor/paper texture URL.
  src: null,
  opacity: 0.055,
  blendMode: "soft-light",
  size: "cover",
  position: "center",
  repeat: "no-repeat",
};

/**
 * Palette keyframes. All colors are interpolated in Oklab instead of RGB.
 * Paper remains light and ink remains dark so note text stays readable.
 */
export const THEME_STOPS: Record<ThemePhase, Record<ThemeToken, string>> = {
  night: {
    skyTop: "#171A33",
    skyMid: "#312B4A",
    skyHorizon: "#665064",
    paper: "#E9DFD1",
    ink: "#201A22",
    highlight: "#743756",
    sun: "#F0A56D",
    moon: "#FFF1CD",
  },
  preDawn: {
    skyTop: "#222A4A",
    skyMid: "#50506F",
    skyHorizon: "#866B86",
    paper: "#F0E5D9",
    ink: "#24202B",
    highlight: "#6B3C5B",
    sun: "#EAA980",
    moon: "#FFF2D0",
  },
  blueDawn: {
    skyTop: "#394B73",
    skyMid: "#847B9D",
    skyHorizon: "#C7A7A6",
    paper: "#F8EEE0",
    ink: "#282129",
    highlight: "#793950",
    sun: "#F4B886",
    moon: "#FFF4D9",
  },
  sunrise: {
    skyTop: "#866B90",
    skyMid: "#D49B92",
    skyHorizon: "#F7C8A3",
    paper: "#FFF4E5",
    ink: "#352126",
    highlight: "#873744",
    sun: "#FFBA7B",
    moon: "#FFF5DD",
  },
  day: {
    skyTop: "#7898BD",
    skyMid: "#B8C7D3",
    skyHorizon: "#F4DEC8",
    paper: "#FFF9EE",
    ink: "#2A2430",
    highlight: "#70364F",
    sun: "#FFE1A3",
    moon: "#F7F0D8",
  },
  golden: {
    skyTop: "#765A80",
    skyMid: "#C77B78",
    skyHorizon: "#F2B27F",
    paper: "#FFF3E3",
    ink: "#3A2225",
    highlight: "#823441",
    sun: "#FFD098",
    moon: "#FFF0CE",
  },
  sunset: {
    skyTop: "#4D416B",
    skyMid: "#9C637E",
    skyHorizon: "#E99B81",
    paper: "#F9E9DC",
    ink: "#35202A",
    highlight: "#70304A",
    sun: "#F6A36F",
    moon: "#FFF0CE",
  },
  blueNight: {
    skyTop: "#25304D",
    skyMid: "#50466D",
    skyHorizon: "#86637D",
    paper: "#F1E6D7",
    ink: "#242035",
    highlight: "#633A63",
    sun: "#D68B70",
    moon: "#FFF0D2",
  },
};

const THEME_TOKENS = Object.keys(THEME_STOPS.night) as ThemeToken[];
const DEG_TO_RAD = Math.PI / 180;
const DAY_MS = 24 * 60 * 60 * 1000;

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const clamp01 = (value: number) => clamp(value, 0, 1);

const smoothstep = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

const smootherstep = (value: number) => {
  const t = clamp01(value);
  return t * t * t * (t * (t * 6 - 15) + 10);
};

const wrapDegrees = (value: number) => ((value + 180) % 360 + 360) % 360 - 180;

const sinDegrees = (degrees: number) => Math.sin(degrees * DEG_TO_RAD);

const isValidDate = (value: unknown): value is Date =>
  value instanceof Date && Number.isFinite(value.getTime());

function assertCoordinates({ latitude, longitude }: GeoCoordinates) {
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new RangeError("latitude must be a finite number between -90 and 90.");
  }

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new RangeError("longitude must be a finite number between -180 and 180.");
  }
}

function hexToLinearRgb(hex: string) {
  const normalized = hex.replace("#", "");

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    throw new Error(`Expected a six-character hex color, got: ${hex}`);
  }

  const srgb = [0, 2, 4].map((offset) =>
    Number.parseInt(normalized.slice(offset, offset + 2), 16) / 255,
  ) as [number, number, number];

  return srgb.map((channel) =>
    channel <= 0.04045
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4),
  ) as [number, number, number];
}

function linearRgbToOklab([r, g, b]: [number, number, number]) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ] as [number, number, number];
}

function oklabToLinearRgb([l, a, b]: [number, number, number]) {
  const lRoot = l + 0.3963377774 * a + 0.2158037573 * b;
  const mRoot = l - 0.1055613458 * a - 0.0638541728 * b;
  const sRoot = l - 0.0894841775 * a - 1.291485548 * b;

  const lCubed = lRoot * lRoot * lRoot;
  const mCubed = mRoot * mRoot * mRoot;
  const sCubed = sRoot * sRoot * sRoot;

  return [
    4.0767416621 * lCubed - 3.3077115913 * mCubed + 0.2309699292 * sCubed,
    -1.2684380046 * lCubed + 2.6097574011 * mCubed - 0.3413193965 * sCubed,
    -0.0041960863 * lCubed - 0.7034186147 * mCubed + 1.707614701 * sCubed,
  ] as [number, number, number];
}

function linearChannelToSrgb(channel: number) {
  const safe = clamp01(channel);
  return safe <= 0.0031308
    ? safe * 12.92
    : 1.055 * Math.pow(safe, 1 / 2.4) - 0.055;
}

function linearRgbToHex(rgb: [number, number, number]) {
  const hex = rgb
    .map((channel) => Math.round(linearChannelToSrgb(channel) * 255))
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("");

  return `#${hex.toUpperCase()}`;
}

/** Interpolate two hex colors in Oklab to avoid dull/muddy RGB blends. */
export function mixHexOklab(from: string, to: string, progress: number) {
  const t = clamp01(progress);
  const fromLab = linearRgbToOklab(hexToLinearRgb(from));
  const toLab = linearRgbToOklab(hexToLinearRgb(to));

  const mixed = fromLab.map(
    (channel, index) => channel + (toLab[index] - channel) * t,
  ) as [number, number, number];

  return linearRgbToHex(oklabToLinearRgb(mixed));
}

function relativeLuminance(hex: string) {
  const [r, g, b] = hexToLinearRgb(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio for two opaque hex colors. */
export function contrastRatio(foreground: string, background: string) {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function ensureMinimumContrast(
  foreground: string,
  background: string,
  minimumRatio: number,
) {
  if (contrastRatio(foreground, background) >= minimumRatio) {
    return foreground;
  }

  const nearBlack = "#17131A";
  const nearWhite = "#FFFDF8";

  return contrastRatio(nearBlack, background) >= contrastRatio(nearWhite, background)
    ? nearBlack
    : nearWhite;
}

const TOKEN_EASING: Record<ThemeToken, (progress: number) => number> = {
  skyTop: smootherstep,
  skyMid: smootherstep,
  skyHorizon: smoothstep,
  paper: smoothstep,
  ink: smoothstep,
  highlight: smootherstep,
  sun: smoothstep,
  moon: smoothstep,
};

interface PhaseEvent {
  at: Date;
  phase: ThemePhase;
}

function getPhaseEventsForDate(date: Date, coordinates: GeoCoordinates): PhaseEvent[] {
  const times = SunCalc.getTimes(date, coordinates.latitude, coordinates.longitude);

  const candidates: Array<{ at: Date | null | undefined; phase: ThemePhase }> = [
    { at: times.nightEnd, phase: "preDawn" },
    { at: times.nauticalDawn, phase: "blueDawn" },
    { at: times.dawn, phase: "sunrise" },
    { at: times.sunrise, phase: "sunrise" },
    { at: times.goldenHourEnd, phase: "day" },
    { at: times.goldenHour, phase: "golden" },
    { at: times.sunset, phase: "sunset" },
    { at: times.dusk, phase: "blueNight" },
    { at: times.nauticalDusk, phase: "blueNight" },
    { at: times.night, phase: "night" },
  ];

  return candidates
    .filter((candidate): candidate is { at: Date; phase: ThemePhase } =>
      isValidDate(candidate.at),
    )
    .map((candidate) => ({ at: candidate.at, phase: candidate.phase }));
}

function fallbackPhase(date: Date, coordinates: GeoCoordinates): ThemePhase {
  const sun = SunCalc.getPosition(date, coordinates.latitude, coordinates.longitude);
  const altitudeDeg = sun.altitude;

  if (altitudeDeg >= 6) return "day";
  if (altitudeDeg >= 0) return "sunrise";
  if (altitudeDeg >= -6) return "blueNight";
  if (altitudeDeg >= -12) return "blueNight";
  if (altitudeDeg >= -18) return "preDawn";
  return "night";
}

/**
 * Builds events from the day before, current day, and next day. This avoids
 * relying on the browser's own time-zone and preserves a continuous result
 * around midnight.
 */
export function getSolarTimeline(date: Date, coordinates: GeoCoordinates): PhaseEvent[] {
  assertCoordinates(coordinates);

  const timeline = [-DAY_MS, 0, DAY_MS]
    .flatMap((offset) => getPhaseEventsForDate(new Date(date.getTime() + offset), coordinates))
    .sort((a, b) => a.at.getTime() - b.at.getTime());

  return timeline;
}

/**
 * Resolve continuously interpolated colors for any selected time and location.
 * `inkOnPaper` and `highlightOnPaper` are contrast-guarded versions for text.
 */
export function getThemeAt(date: Date, coordinates: GeoCoordinates): ThemeColors {
  assertCoordinates(coordinates);

  const timeline = getSolarTimeline(date, coordinates);
  const currentTime = date.getTime();

  if (timeline.length === 0) {
    const phase = fallbackPhase(date, coordinates);
    const fallback = THEME_STOPS[phase];

    return {
      ...fallback,
      inkOnPaper: ensureMinimumContrast(fallback.ink, fallback.paper, 7),
      highlightOnPaper: ensureMinimumContrast(fallback.highlight, fallback.paper, 4.5),
    };
  }

  const rightIndex = timeline.findIndex((event) => event.at.getTime() > currentTime);
  const left =
    rightIndex <= 0
      ? { at: new Date(currentTime - DAY_MS), phase: fallbackPhase(date, coordinates) }
      : timeline[rightIndex - 1];
  const right =
    rightIndex === -1
      ? { at: new Date(currentTime + DAY_MS), phase: fallbackPhase(date, coordinates) }
      : timeline[rightIndex];

  const duration = Math.max(1, right.at.getTime() - left.at.getTime());
  const progress = clamp01((currentTime - left.at.getTime()) / duration);

  const colors = Object.fromEntries(
    THEME_TOKENS.map((token) => [
      token,
      mixHexOklab(
        THEME_STOPS[left.phase][token],
        THEME_STOPS[right.phase][token],
        TOKEN_EASING[token](progress),
      ),
    ]),
  ) as Record<ThemeToken, string>;

  return {
    ...colors,
    inkOnPaper: ensureMinimumContrast(colors.ink, colors.paper, 7),
    highlightOnPaper: ensureMinimumContrast(colors.highlight, colors.paper, 4.5),
  };
}

/**
 * Projects SunCalc's azimuth/altitude values into normalized scene coordinates.
 * It deliberately returns percentages rather than pixels so it scales across
 * mobile, tablet, desktop, portrait, and ultrawide layouts.
 */
export function projectCelestialBody(
  position: { altitude: number; azimuth: number },
  options: CelestialProjectionOptions = {},
): ProjectedCelestialBody {
  const {
    cameraAzimuthDeg = 180,
    mirrorScene = false,
    horizonY = 82,
    zenithY = 10,
    horizontalPadding = 5,
  } = options;

  const relativeAzimuth = wrapDegrees(position.azimuth - cameraAzimuthDeg);
  const side = mirrorScene ? -1 : 1;
  const x = clamp(
    50 + side * (50 - horizontalPadding) * sinDegrees(relativeAzimuth),
    horizontalPadding,
    100 - horizontalPadding,
  );

  const altitudeForPlacement = clamp(position.altitude, 0, 90);
  const y = horizonY - (horizonY - zenithY) * sinDegrees(altitudeForPlacement);
  const isWithinView = Math.abs(relativeAzimuth) <= 101;
  const isAboveHorizon = position.altitude >= 0;
  const horizonFade = smoothstep((position.altitude + 6) / 6);

  return {
    x,
    y,
    opacity: isWithinView ? horizonFade : 0,
    isWithinView,
    isAboveHorizon,
  };
}

/** Get responsive sun, moon, and real lunar illumination data for the scene. */
export function getCelestialLayout(
  date: Date,
  coordinates: GeoCoordinates,
  options: CelestialProjectionOptions = {},
): CelestialLayout {
  assertCoordinates(coordinates);

  const sunPosition = SunCalc.getPosition(
    date,
    coordinates.latitude,
    coordinates.longitude,
  );
  const moonPosition = SunCalc.getMoonPosition(
    date,
    coordinates.latitude,
    coordinates.longitude,
  );
  const moonIllumination = SunCalc.getMoonIllumination(date);

  const sun = projectCelestialBody(sunPosition, options);
  const moonBase = projectCelestialBody(moonPosition, options);
  const isNight = sunPosition.altitude <= -6;
  const dayMoonVisibility = isNight ? 1 : 0.28;

  return {
    sun: {
      ...sun,
      altitudeDeg: sunPosition.altitude,
      azimuthDeg: sunPosition.azimuth,
    },
    moon: {
      ...moonBase,
      // The moon remains subtly visible in the day, but is strongest at night.
      opacity: moonBase.opacity * (0.25 + moonIllumination.fraction * 0.75) * dayMoonVisibility,
      altitudeDeg: moonPosition.altitude,
      azimuthDeg: moonPosition.azimuth,
      illumination: moonIllumination.fraction,
      phase: moonIllumination.phase,
      waxing: moonIllumination.waxing,
      limbAngleDeg: (moonIllumination.angle - moonPosition.parallacticAngle) % 360,
    },
  };
}

/** A CSS gradient string for the sky; works without CSS Color 5 support. */
export function getSkyGradientCss(theme: Pick<ThemeColors, "skyTop" | "skyMid" | "skyHorizon">) {
  return `linear-gradient(180deg, ${theme.skyTop} 0%, ${theme.skyMid} 54%, ${theme.skyHorizon} 100%)`;
}

/**
 * CSS custom properties ready for React's style prop or a DOM element.
 * The caller can use them with the `scene` CSS shown below.
 */
export function getSceneCssVariables(
  theme: ThemeColors,
  layout: CelestialLayout,
  overlay: StaticOverlayConfig = STATIC_OVERLAY,
): Record<string, string> {
  return {
    "--sky-top": theme.skyTop,
    "--sky-mid": theme.skyMid,
    "--sky-horizon": theme.skyHorizon,
    "--paper": theme.paper,
    "--ink": theme.inkOnPaper,
    "--highlight": theme.highlightOnPaper,
    "--sun-color": theme.sun,
    "--moon-color": theme.moon,
    "--sun-x": `${layout.sun.x}%`,
    "--sun-y": `${layout.sun.y}%`,
    "--sun-opacity": `${layout.sun.opacity}`,
    "--moon-x": `${layout.moon.x}%`,
    "--moon-y": `${layout.moon.y}%`,
    "--moon-opacity": `${layout.moon.opacity}`,
    "--moon-limb-angle": `${layout.moon.limbAngleDeg}deg`,
    "--overlay-image": overlay.src ? `url("${overlay.src}")` : "none",
    "--overlay-opacity": `${clamp01(overlay.opacity)}`,
    "--overlay-blend-mode": overlay.blendMode,
    "--overlay-size": overlay.size,
    "--overlay-position": overlay.position,
    "--overlay-repeat": overlay.repeat,
  };
}

/**
 * Example CSS:
 *
 * .scene {
 *   position: relative;
 *   min-block-size: 100svh;
 *   overflow: hidden;
 *   isolation: isolate;
 *   background: linear-gradient(
 *     180deg,
 *     var(--sky-top) 0%,
 *     var(--sky-mid) 54%,
 *     var(--sky-horizon) 100%
 *   );
 * }
 *
 * .scene::after {
 *   content: "";
 *   position: absolute;
 *   inset: 0;
 *   z-index: 0;
 *   pointer-events: none;
 *   background-image: var(--overlay-image);
 *   background-repeat: var(--overlay-repeat);
 *   background-size: var(--overlay-size);
 *   background-position: var(--overlay-position);
 *   mix-blend-mode: var(--overlay-blend-mode);
 *   opacity: var(--overlay-opacity);
 * }
 *
 * .celestial {
 *   position: absolute;
 *   z-index: 1;
 *   left: var(--sun-x);
 *   top: var(--sun-y);
 *   width: clamp(32px, 8vmin, 112px);
 *   aspect-ratio: 1;
 *   transform: translate(-50%, -50%);
 *   opacity: var(--sun-opacity);
 * }
 *
 * .moon {
 *   left: var(--moon-x);
 *   top: var(--moon-y);
 *   opacity: var(--moon-opacity);
 *   transform: translate(-50%, -50%) rotate(var(--moon-limb-angle));
 * }
 *
 * .haiku-card {
 *   position: relative;
 *   z-index: 2;
 *   background: var(--paper);
 *   color: var(--ink);
 *   border: 1px solid color-mix(in srgb, var(--highlight) 30%, transparent);
 * }
 */
