import { contrastRatio } from "@/theme/celestialTheme";

const NEAR_BLACK = "#17131A";
const NEAR_WHITE = "#FFFDF8";
const FALLBACK_FILL = "#ffffff";

/** Ant Design Tag preset names → fill hex (approx. default Ant palette). */
const NAMED_LABEL_FILLS: Record<string, string> = {
  default: "#f5f5f5",
  success: "#52c41a",
  processing: "#1677ff",
  error: "#ff4d4f",
  warning: "#faad14",
  magenta: "#eb2f96",
  red: "#ff4d4f",
  volcano: "#fa541c",
  orange: "#fa8c16",
  gold: "#faad14",
  lime: "#a0d911",
  green: "#52c41a",
  cyan: "#13c2c2",
  blue: "#1677ff",
  geekblue: "#2f54eb",
  purple: "#722ed1",
};

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

function expandShortHex(hex: string): string {
  if (hex.length !== 4) return hex.toLowerCase();
  const [, r, g, b] = hex;
  return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
}

/** Resolve label color (hex or Ant Tag name) to an opaque fill hex. */
export function resolveComicLabelFill(color: string): string {
  const trimmed = color.trim();
  if (!trimmed) return FALLBACK_FILL;
  if (HEX_RE.test(trimmed)) return expandShortHex(trimmed);
  const named = NAMED_LABEL_FILLS[trimmed.toLowerCase()];
  return named ?? FALLBACK_FILL;
}

/** Pick near-black or near-white ink for readable text on `fill`. */
export function pickComicLabelInk(fill: string): string {
  return contrastRatio(NEAR_BLACK, fill) >= contrastRatio(NEAR_WHITE, fill)
    ? NEAR_BLACK
    : NEAR_WHITE;
}
