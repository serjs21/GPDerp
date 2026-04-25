import type { ThemeName } from "@/config/userConfiguration";

type ThemeVars = Record<string, string>;

type ThemeStop = {
  progress: number;
  vars: ThemeVars;
};

export type ThemeScalePoint = {
  id: string;
  progress: number;
  vars: ThemeVars;
  persistedTheme: ThemeName;
};

const PREVIEW_THEME_VARS = [
  "--background",
  "--background-color",
  "--text-color",
  "--text-muted",
  "--input-bg",
  "--profile-surface-bg",
  "--profile-surface-border",
  "--gradientStart",
  "--gradientMid",
  "--surface-glass",
  "--surface-glass-strong",
  "--surface-border-soft",
  "--accent-red",
  "--hanko-red",
  "--shrine-accent",
  "--shrine-accent-soft",
  "--shrine-ink",
  "--shrine-ink-light",
  "--shrine-placeholder",
  "--sumi-ink",
  "--footer-border",
  "--footer-separator",
  "--footer-muted",
  "--border-color",
] as const;

const THEME_STOPS: ThemeStop[] = [
  {
    progress: 0,
    vars: {
      "--background": "#fff3d7",
      "--background-color": "#fff3d7",
      "--text-color": "#3f2f28",
      "--text-muted": "#856b5b",
      "--input-bg": "#fff7e8",
      "--profile-surface-bg": "#fff8ec",
      "--profile-surface-border": "#dfc8aa",
      "--gradientStart": "#ffeac2",
      "--gradientMid": "#fff4de",
      "--surface-glass": "#fff8ece8",
      "--surface-glass-strong": "#ffffff",
      "--surface-border-soft": "#cba478",
      "--accent-red": "#e08d3c",
      "--hanko-red": "#e08d3c",
      "--shrine-accent": "#e08d3c",
      "--shrine-accent-soft": "#ecb173",
      "--shrine-ink": "#574236",
      "--shrine-ink-light": "#927663",
      "--shrine-placeholder": "#a28a78",
      "--sumi-ink": "#3f2f28",
      "--footer-border": "#d8c1a1",
      "--footer-separator": "#9e826a",
      "--footer-muted": "#937863",
      "--border-color": "#d6c0a3",
    },
  },
  {
    progress: 75,
    vars: {
      "--background": "#f0d5c6",
      "--background-color": "#f0d5c6",
      "--text-color": "#3f2c2c",
      "--text-muted": "#7d5f60",
      "--input-bg": "#f9e4d8",
      "--profile-surface-bg": "#f8e3d8",
      "--profile-surface-border": "#cfa7a3",
      "--gradientStart": "#f4c8ac",
      "--gradientMid": "#f2d6c8",
      "--surface-glass": "#f8dfd3da",
      "--surface-glass-strong": "#f6ddd2f2",
      "--surface-border-soft": "#ba6a5c",
      "--accent-red": "#d74844",
      "--hanko-red": "#d74844",
      "--shrine-accent": "#d74844",
      "--shrine-accent-soft": "#e4806f",
      "--shrine-ink": "#553b39",
      "--shrine-ink-light": "#946d66",
      "--shrine-placeholder": "#9f7b74",
      "--sumi-ink": "#3f2c2c",
      "--footer-border": "#c8968f",
      "--footer-separator": "#8d6260",
      "--footer-muted": "#8c6460",
      "--border-color": "#c89c99",
    },
  },
  {
    progress: 100,
    vars: {
      "--background": "#151b35",
      "--background-color": "#151b35",
      "--text-color": "#ece9f6",
      "--text-muted": "#b6aacd",
      "--input-bg": "#1f2748",
      "--profile-surface-bg": "#232d54",
      "--profile-surface-border": "#8d8bc0",
      "--gradientStart": "#1c2244",
      "--gradientMid": "#262e5d",
      "--surface-glass": "#1f2647d4",
      "--surface-glass-strong": "#252d55ed",
      "--surface-border-soft": "#7a79b0",
      "--accent-red": "#7764b2",
      "--hanko-red": "#7764b2",
      "--shrine-accent": "#7764b2",
      "--shrine-accent-soft": "#9a89cd",
      "--shrine-ink": "#e3dff2",
      "--shrine-ink-light": "#b4a9d4",
      "--shrine-placeholder": "#a39abe",
      "--sumi-ink": "#ece9f6",
      "--footer-border": "#6f73a6",
      "--footer-separator": "#aaa5c8",
      "--footer-muted": "#b1abcb",
      "--border-color": "#8686b5",
    },
  },
];

type Rgba = {
  r: number;
  g: number;
  b: number;
  a: number;
};

type Oklab = {
  l: number;
  a: number;
  b: number;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const clamp255 = (value: number) => Math.min(255, Math.max(0, Math.round(value)));
const smoothstep = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

const hexToRgba = (hex: string): Rgba => {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3 || normalized.length === 4
      ? normalized
          .split("")
          .map((ch) => `${ch}${ch}`)
          .join("")
      : normalized;

  if (full.length === 6) {
    const value = Number.parseInt(full, 16);
    return {
      r: (value >> 16) & 255,
      g: (value >> 8) & 255,
      b: value & 255,
      a: 1,
    };
  }

  const value = Number.parseInt(full, 16);
  return {
    r: (value >> 24) & 255,
    g: (value >> 16) & 255,
    b: (value >> 8) & 255,
    a: (value & 255) / 255,
  };
};

const srgbToLinear = (channel: number) => {
  const c = channel / 255;
  if (c <= 0.04045) return c / 12.92;
  return ((c + 0.055) / 1.055) ** 2.4;
};

const linearToSrgb = (channel: number) => {
  const c = clamp01(channel);
  if (c <= 0.0031308) return c * 12.92;
  return 1.055 * c ** (1 / 2.4) - 0.055;
};

const rgbaToOklab = (color: Rgba): Oklab => {
  const r = srgbToLinear(color.r);
  const g = srgbToLinear(color.g);
  const b = srgbToLinear(color.b);

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const lCbrt = Math.cbrt(l);
  const mCbrt = Math.cbrt(m);
  const sCbrt = Math.cbrt(s);

  return {
    l: 0.2104542553 * lCbrt + 0.793617785 * mCbrt - 0.0040720468 * sCbrt,
    a: 1.9779984951 * lCbrt - 2.428592205 * mCbrt + 0.4505937099 * sCbrt,
    b: 0.0259040371 * lCbrt + 0.7827717662 * mCbrt - 0.808675766 * sCbrt,
  };
};

const oklabToRgba = (color: Oklab, alpha: number): Rgba => {
  const lCbrt = color.l + 0.3963377774 * color.a + 0.2158037573 * color.b;
  const mCbrt = color.l - 0.1055613458 * color.a - 0.0638541728 * color.b;
  const sCbrt = color.l - 0.0894841775 * color.a - 1.291485548 * color.b;

  const l = lCbrt ** 3;
  const m = mCbrt ** 3;
  const s = sCbrt ** 3;

  const rLin = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  return {
    r: clamp255(linearToSrgb(rLin) * 255),
    g: clamp255(linearToSrgb(gLin) * 255),
    b: clamp255(linearToSrgb(bLin) * 255),
    a: clamp01(alpha),
  };
};

// Perceptual interpolation in OKLab with eased ratio provides smoother, less muddy transitions.
const mixColor = (from: string, to: string, ratio: number) => {
  const source = hexToRgba(from);
  const target = hexToRgba(to);
  const start = rgbaToOklab(source);
  const end = rgbaToOklab(target);
  const t = smoothstep(ratio);

  const mixedLab: Oklab = {
    l: start.l + (end.l - start.l) * t,
    a: start.a + (end.a - start.a) * t,
    b: start.b + (end.b - start.b) * t,
  };
  const mixedAlpha = source.a + (target.a - source.a) * t;
  const mixed = oklabToRgba(mixedLab, mixedAlpha);

  if (mixed.a < 0.999) {
    return `rgba(${mixed.r}, ${mixed.g}, ${mixed.b}, ${Number(mixed.a.toFixed(3))})`;
  }
  return `rgb(${mixed.r}, ${mixed.g}, ${mixed.b})`;
};

const persistedThemeFromProgress = (progress: number): ThemeName => {
  if (progress < 75) return "sumie";
  if (progress >= 90) return "night-sky";
  return "tokyo-dusk";
};

const getInterpolatedVars = (progress: number): ThemeVars => {
  const clamped = Math.min(100, Math.max(0, progress));
  const from = clamped <= 75 ? THEME_STOPS[0] : THEME_STOPS[1];
  const to = clamped <= 75 ? THEME_STOPS[1] : THEME_STOPS[2];
  const span = to.progress - from.progress;
  const ratio = span === 0 ? 0 : (clamped - from.progress) / span;

  return PREVIEW_THEME_VARS.reduce(
    (acc, key) => {
      acc[key] = mixColor(from.vars[key], to.vars[key], ratio);
      return acc;
    },
    {} as ThemeVars,
  );
};

export const THEME_SCALE_POINTS: ThemeScalePoint[] = Array.from({ length: 101 }, (_, progress) => ({
  id: `sunset-${progress.toString().padStart(3, "0")}`,
  progress,
  vars: getInterpolatedVars(progress),
  persistedTheme: persistedThemeFromProgress(progress),
}));

export const getThemeScalePoint = (progress: number): ThemeScalePoint => {
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));
  return THEME_SCALE_POINTS[clamped];
};

export const getThemeScaleVars = (progress: number): ThemeVars => getThemeScalePoint(progress).vars;

export const getPersistedThemeFromScale = (progress: number): ThemeName =>
  getThemeScalePoint(progress).persistedTheme;

