export type ComicPanelBackground =
  | "sunburst"
  | "sunburstHalftone"
  | "halftone"
  | "solid"
  | "motion"
  | "fine";

export type ComicPanelNamedColor =
  | "magenta"
  | "teal"
  | "yellow"
  | "orange"
  | "purple"
  | "blue"
  | "red"
  | "white"
  | "cream"
  | "info"
  | "green"
  | "darkGreen"
  | "sky"
  | "soviet";

/** Named preset or any `#…` hex (or CSS color starting with `#`). */
export type ComicPanelColor = ComicPanelNamedColor | `#${string}`;

export const COMIC_PAGE_GUTTER_PX = 10;
/** Black frame around the white page; sized to hold the close control. */
export const COMIC_PAGE_FRAME_GUTTER_PX = 16;
export const COMIC_PAGE_BORDER_PX = 4;
export const COMIC_PAGE_INSET_PX = 3;

export const COMIC_PANEL_COLORS: Record<
  ComicPanelNamedColor,
  { base: string; accent?: string }
> = {
  magenta: { base: "#e91e8c", accent: "#ff6ec7" },
  teal: { base: "#00bcd4", accent: "#4dd0e1" },
  yellow: { base: "#ffeb3b", accent: "#fff176" },
  orange: { base: "#ff9800", accent: "#ffb74d" },
  purple: { base: "#9c27b0", accent: "#ce93d8" },
  blue: { base: "#2196f3", accent: "#64b5f6" },
  red: { base: "#f44336", accent: "#ef5350" },
  white: { base: "#ffffff", accent: "#c8c8c8" },
  green: { base: "#81c784", accent: "#4caf50" },
  cream: { base: "#faf6ee", accent: "#f0e6d8" },
  info: { base: "#e8f4fc", accent: "#b3d9f0" },
  darkGreen: { base: "#4caf50", accent: "#81c784" },
  sky: {
    base: "var(--sky-mid, #a8cce0)",
    accent: "var(--sky-horizon, #d4e6f0)",
  },
  soviet: { base: "#cc0000", accent: "#ffd700" },
};

export function resolveComicPanelColor(
  color: ComicPanelColor,
): { base: string; accent: string } {
  if (Object.prototype.hasOwnProperty.call(COMIC_PANEL_COLORS, color)) {
    const preset = COMIC_PANEL_COLORS[color as ComicPanelNamedColor];
    return { base: preset.base, accent: preset.accent ?? preset.base };
  }
  return { base: color, accent: color };
}

export type ComicPageRowColumns = `${number}fr-${number}fr`;

export const COMIC_PAGE_BLANK_TEMPLATE_ROWS: ComicPageRowColumns[] = [
  "2fr-1fr",
  "1fr-2fr",
  "2fr-1fr",
];

export function parseRowColumns(columns: ComicPageRowColumns): [number, number] {
  const [left, right] = columns.split("-").map((part) => Number.parseFloat(part.replace("fr", "")));
  return [left, right];
}
