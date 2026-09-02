import type { CSSProperties } from "react";
import { PAPER_COLORS, PAPER_ROUGH_DEFAULTS } from "@/components/PaperModal/paperTokens";

export const NOTEBOOK_LINE_HEIGHT = "1.75rem";
export const NOTEBOOK_PAD_X = "1rem";
export const NOTEBOOK_PAD_Y = "0.65rem";
export const NOTEBOOK_MARGIN_X = "2.5rem";
export const NOTEBOOK_VISIBLE_MESSAGE_LINES = 4;
export const NOTEBOOK_ROUGH_SEED = 84;
/** Cool white-gray paper (not warm cream). */
export const NOTEBOOK_PAPER = "#f2f4f7";

export const NOTEBOOK_ROUGH = {
  roughness: PAPER_ROUGH_DEFAULTS.roughness,
  bowing: PAPER_ROUGH_DEFAULTS.bowing,
  strokeWidth: 1.1,
  stroke: PAPER_COLORS.inkSoft,
  fill: PAPER_ROUGH_DEFAULTS.fill,
} as const;

export function notebookStyleVars(): CSSProperties {
  return {
    "--notebook-line-height": NOTEBOOK_LINE_HEIGHT,
    "--notebook-font-family": "var(--font-lantern-script, \"Zen Kurenaido\", cursive)",
    "--notebook-pad-x": NOTEBOOK_PAD_X,
    "--notebook-pad-y": NOTEBOOK_PAD_Y,
    "--notebook-margin-x": NOTEBOOK_MARGIN_X,
    "--notebook-paper": NOTEBOOK_PAPER,
    "--notebook-ink": PAPER_COLORS.ink,
    "--notebook-ink-soft": PAPER_COLORS.inkSoft,
  } as CSSProperties;
}

export function readNotebookMetrics(host: HTMLElement) {
  const style = getComputedStyle(host);
  const rootFontSize =
    typeof document !== "undefined"
      ? Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
      : 16;
  const lineHeight = Number.parseFloat(style.getPropertyValue("--notebook-line-height")) || 1.75;
  const lineHeightUnit = style.getPropertyValue("--notebook-line-height").trim().endsWith("rem")
    ? lineHeight * rootFontSize
    : lineHeight;
  const padX = parseCssLength(style.getPropertyValue("--notebook-pad-x"), `${rootFontSize}px`);
  const padY = parseCssLength(style.getPropertyValue("--notebook-pad-y"), `${rootFontSize}px`);
  const marginX = parseCssLength(style.getPropertyValue("--notebook-margin-x"), `${rootFontSize}px`);
  return {
    lineHeightPx: lineHeightUnit,
    padX,
    padY,
    marginX,
  };
}

/** Rule Y positions (px, host-local) aligned to row layout + message line grid. */
export function collectNotebookRuleYs(host: HTMLElement, lineHeightPx: number, padY: number): number[] {
  const hostRect = host.getBoundingClientRect();
  const ys = new Set<number>();

  for (const selector of ["[data-notebook-row=\"to\"]", "[data-notebook-row=\"spacer\"]"] as const) {
    const row = host.querySelector(selector);
    if (!row) continue;
    ys.add(Math.round(row.getBoundingClientRect().bottom - hostRect.top));
  }

  const message = host.querySelector("[data-notebook-row=\"message\"]");
  if (message) {
    const msgTop = message.getBoundingClientRect().top - hostRect.top;
    const msgHeight = message.getBoundingClientRect().height;
    const msgLineHeightPx =
      Number.parseFloat(getComputedStyle(message).lineHeight) || lineHeightPx;
    const lineCount = Math.max(1, Math.ceil(msgHeight / msgLineHeightPx));
    for (let i = 1; i <= lineCount; i += 1) {
      ys.add(Math.round(msgTop + msgLineHeightPx * i));
    }
  } else {
    const innerBottom = host.clientHeight - padY;
    for (let y = padY + lineHeightPx; y <= innerBottom; y += lineHeightPx) {
      ys.add(Math.round(y));
    }
  }

  return [...ys].sort((a, b) => a - b);
}

function parseCssLength(value: string, fontSize: string): number {
  const trimmed = value.trim();
  const rootSize = Number.parseFloat(fontSize) || 16;
  if (trimmed.endsWith("rem")) {
    return Number.parseFloat(trimmed) * rootSize;
  }
  if (trimmed.endsWith("px")) {
    return Number.parseFloat(trimmed);
  }
  return Number.parseFloat(trimmed) || 0;
}
