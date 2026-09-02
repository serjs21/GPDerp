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
  const lineHeight = Number.parseFloat(style.getPropertyValue("--notebook-line-height")) || 1.75;
  const lineHeightUnit = style.getPropertyValue("--notebook-line-height").trim().endsWith("rem")
    ? lineHeight * (Number.parseFloat(style.fontSize) || 16)
    : lineHeight;
  const padX = parseCssLength(style.getPropertyValue("--notebook-pad-x"), style.fontSize);
  const padY = parseCssLength(style.getPropertyValue("--notebook-pad-y"), style.fontSize);
  const marginX = parseCssLength(style.getPropertyValue("--notebook-margin-x"), style.fontSize);
  return {
    lineHeightPx: lineHeightUnit,
    padX,
    padY,
    marginX,
  };
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
