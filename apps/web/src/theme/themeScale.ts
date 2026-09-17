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
  "--bg-art-opacity",
] as const;

const THEME_STOPS: ThemeStop[] = [
  {
    progress: 0,
    vars: {
      "--background": "#9fd3ff",
      "--background-color": "#9fd3ff",
      "--text-color": "#1d2531",
      "--text-muted": "#3f556f",
      "--input-bg": "#d5ecff",
      "--profile-surface-bg": "#dff1ff",
      "--profile-surface-border": "#7ca3c8",
      "--gradientStart": "#79c1ff",
      "--gradientMid": "#cbe9ff",
      "--surface-glass": "#dcf1ffe0",
      "--surface-glass-strong": "#eef8ffff",
      "--surface-border-soft": "#5f8fbe",
      "--shrine-accent": "#4a9de5",
      "--shrine-accent-soft": "#8fc6f5",
      "--shrine-ink": "#223247",
      "--shrine-ink-light": "#4d6988",
      "--shrine-placeholder": "#5f7691",
      "--sumi-ink": "#1d2531",
      "--footer-border": "#7da8ce",
      "--footer-separator": "#4d7398",
      "--footer-muted": "#4f6f90",
      "--border-color": "#78a4ca",
      "--bg-art-opacity": "0.82",
    },
  },
  {
    progress: 25,
    vars: {
      "--background": "#b283d2",
      "--background-color": "#b283d2",
      "--text-color": "#231b2d",
      "--text-muted": "#5b446f",
      "--input-bg": "#d9bce9",
      "--profile-surface-bg": "#dec5ec",
      "--profile-surface-border": "#8e67aa",
      "--gradientStart": "#8f63be",
      "--gradientMid": "#c29adf",
      "--surface-glass": "#dfc3ecdc",
      "--surface-glass-strong": "#ebd8f5f0",
      "--surface-border-soft": "#8058a2",
      "--shrine-accent": "#9962ce",
      "--shrine-accent-soft": "#bf90e5",
      "--shrine-ink": "#2b1f37",
      "--shrine-ink-light": "#63497b",
      "--shrine-placeholder": "#735a8b",
      "--sumi-ink": "#231b2d",
      "--footer-border": "#976fb3",
      "--footer-separator": "#654b80",
      "--footer-muted": "#694f84",
      "--border-color": "#9a73b5",
      "--bg-art-opacity": "0.8",
    },
  },
  {
    progress: 50,
    vars: {
      "--background": "#e58b62",
      "--background-color": "#e58b62",
      "--text-color": "#3a2420",
      "--text-muted": "#7f4f43",
      "--input-bg": "#f2b18d",
      "--profile-surface-bg": "#f5b999",
      "--profile-surface-border": "#ad553f",
      "--gradientStart": "#cf5440",
      "--gradientMid": "#f6c86e",
      "--surface-glass": "#f0b292dc",
      "--surface-glass-strong": "#f7c7aef0",
      "--surface-border-soft": "#ab4d3c",
      "--shrine-accent": "#db5c3e",
      "--shrine-accent-soft": "#f3b564",
      "--shrine-ink": "#422a24",
      "--shrine-ink-light": "#895544",
      "--shrine-placeholder": "#9b6350",
      "--sumi-ink": "#3a2420",
      "--footer-border": "#b6624b",
      "--footer-separator": "#7f4737",
      "--footer-muted": "#845040",
      "--border-color": "#b96853",
      "--bg-art-opacity": "0.78",
    },
  },
  {
    progress: 75,
    vars: {
      "--background": "#4f4a86",
      "--background-color": "#4f4a86",
      "--text-color": "#f0e9ff",
      "--text-muted": "#d0c2f3",
      "--input-bg": "#66619e",
      "--profile-surface-bg": "#6f6ba8",
      "--profile-surface-border": "#b2a6dc",
      "--gradientStart": "#51488f",
      "--gradientMid": "#7d61af",
      "--surface-glass": "#6a63a4d4",
      "--surface-glass-strong": "#756db2e8",
      "--surface-border-soft": "#afa2dc",
      "--shrine-accent": "#8b79d0",
      "--shrine-accent-soft": "#b0a2e5",
      "--shrine-ink": "#eee7ff",
      "--shrine-ink-light": "#ccc0ef",
      "--shrine-placeholder": "#b3a5dc",
      "--sumi-ink": "#f0e9ff",
      "--footer-border": "#a89fda",
      "--footer-separator": "#cec2f1",
      "--footer-muted": "#d4c9f4",
      "--border-color": "#aba0db",
      "--bg-art-opacity": "0.75",
    },
  },
  {
    progress: 100,
    vars: {
      "--background": "#091637",
      "--background-color": "#091637",
      "--text-color": "#e6efdb",
      "--text-muted": "#d7caa2",
      "--input-bg": "#1f438f",
      "--profile-surface-bg": "#2753a8",
      "--profile-surface-border": "#89a7e6",
      "--gradientStart": "#14357f",
      "--gradientMid": "#2e60bc",
      "--surface-glass": "#1f4690dc",
      "--surface-glass-strong": "#2954a8ef",
      "--surface-border-soft": "#8fb0f0",
      "--shrine-accent": "#ccb867",
      "--shrine-accent-soft": "#f4e6aa",
      "--shrine-ink": "#fff2cb",
      "--shrine-ink-light": "#ddcca1",
      "--shrine-placeholder": "#ccb98a",
      "--sumi-ink": "#e6efdb",
      "--footer-border": "#89a7e6",
      "--footer-separator": "#e1d1a2",
      "--footer-muted": "#dac999",
      "--border-color": "#89a7e6",
      "--bg-art-opacity": "0.72",
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
const lerpNumber = (from: number, to: number, t: number) => from + (to - from) * clamp01(t);

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

const cssColorToRgba = (value: string): Rgba => {
  const color = value.trim();
  if (color.startsWith("rgb")) {
    const parts = color
      .replace(/rgba?\(/, "")
      .replace(")", "")
      .split(",")
      .map((part) => part.trim());
    return {
      r: Number.parseFloat(parts[0] ?? "0"),
      g: Number.parseFloat(parts[1] ?? "0"),
      b: Number.parseFloat(parts[2] ?? "0"),
      a: parts[3] === undefined ? 1 : Number.parseFloat(parts[3]),
    };
  }
  return hexToRgba(color);
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

const rgbaOver = (foreground: Rgba, background: Rgba): Rgba => {
  const outAlpha = foreground.a + background.a * (1 - foreground.a);
  if (outAlpha <= 0) return { r: 0, g: 0, b: 0, a: 0 };
  return {
    r: Math.round((foreground.r * foreground.a + background.r * background.a * (1 - foreground.a)) / outAlpha),
    g: Math.round((foreground.g * foreground.a + background.g * background.a * (1 - foreground.a)) / outAlpha),
    b: Math.round((foreground.b * foreground.a + background.b * background.a * (1 - foreground.a)) / outAlpha),
    a: outAlpha,
  };
};

const relativeLuminance = (color: Rgba): number => {
  const r = srgbToLinear(color.r);
  const g = srgbToLinear(color.g);
  const b = srgbToLinear(color.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrastRatio = (foreground: string, background: string): number => {
  const fg = cssColorToRgba(foreground);
  const bg = cssColorToRgba(background);
  const composed = fg.a < 1 ? rgbaOver(fg, bg) : fg;
  const l1 = relativeLuminance(composed);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

// Perceptual interpolation in OKLab with eased ratio provides smoother, less muddy transitions.
const mixColor = (from: string, to: string, ratio: number) => {
  const source = cssColorToRgba(from);
  const target = cssColorToRgba(to);
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

const mixVar = (key: string, from: string, to: string, ratio: number) => {
  if (key === "--bg-art-opacity") {
    const fromValue = Number.parseFloat(from);
    const toValue = Number.parseFloat(to);
    const mixed = lerpNumber(Number.isNaN(fromValue) ? 0.8 : fromValue, Number.isNaN(toValue) ? 0.8 : toValue, ratio);
    return mixed.toFixed(3);
  }
  return mixColor(from, to, ratio);
};

const persistedThemeFromProgress = (progress: number): ThemeName => {
  if (progress < 35) return "sumie";
  if (progress >= 75) return "night-sky";
  return "tokyo-dusk";
};

const getInterpolatedVars = (progress: number): ThemeVars => {
  const clamped = Math.min(100, Math.max(0, progress));
  const stopIndex = THEME_STOPS.findIndex((stop) => clamped <= stop.progress);
  const toIndex = stopIndex <= 0 ? 1 : stopIndex;
  const fromIndex = Math.max(0, toIndex - 1);
  const from = THEME_STOPS[fromIndex];
  const to = THEME_STOPS[toIndex] ?? THEME_STOPS[THEME_STOPS.length - 1];
  const span = to.progress - from.progress;
  const ratio = span === 0 ? 0 : (clamped - from.progress) / span;

  const interpolated = PREVIEW_THEME_VARS.reduce(
    (acc, key) => {
      acc[key] = mixVar(key, from.vars[key], to.vars[key], ratio);
      return acc;
    },
    {} as ThemeVars,
  );

  const targetText = mixColor("#1d2531", "#e6efdb", clamped / 100);
  const background = interpolated["--background"];
  const fallbackDark = "#1b1f2a";
  const fallbackLight = "#fff7d5";
  const targetContrast = contrastRatio(targetText, background);
  const darkContrast = contrastRatio(fallbackDark, background);
  const lightContrast = contrastRatio(fallbackLight, background);

  let readableText = targetText;
  if (targetContrast < 4.5) {
    readableText = darkContrast > lightContrast ? fallbackDark : fallbackLight;
  }
  const mutedText = mixColor(readableText, background, 0.38);

  interpolated["--text-color"] = readableText;
  interpolated["--text-muted"] = mutedText;
  interpolated["--sumi-ink"] = readableText;
  interpolated["--shrine-ink"] = mixColor(readableText, "#fff7d5", 0.15);
  interpolated["--shrine-ink-light"] = mixColor(mutedText, background, 0.2);
  interpolated["--shrine-placeholder"] = mixColor(mutedText, background, 0.35);

  return interpolated;
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

