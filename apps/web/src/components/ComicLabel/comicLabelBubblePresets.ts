import type { BubbleSpec } from "comicaljs";
import {
  buildBubbleSpec,
  styleUsesTail,
  type ComicBubbleStyle,
} from "@/components/ComicConfirmModal/comicBubblePresets";

export const COMIC_LABEL_DEFAULT_BUBBLE_STYLE: ComicBubbleStyle = "pointedArcs";

const HEX_RE = /^#([0-9a-f]{6})$/i;

function clampByte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

/** Darken a hex fill ~18% for burst edge accent (two-tone halftone approximation). */
export function darkenComicLabelFill(fill: string, amount = 0.18): string {
  const match = fill.match(HEX_RE);
  if (!match) return fill;

  const hex = match[1]!;
  const r = clampByte(parseInt(hex.slice(0, 2), 16) * (1 - amount));
  const g = clampByte(parseInt(hex.slice(2, 4), 16) * (1 - amount));
  const b = clampByte(parseInt(hex.slice(4, 6), 16) * (1 - amount));

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function comicLabelBackgroundColors(fill: string, style: ComicBubbleStyle): string[] {
  if (style === "caption") {
    return [fill, darkenComicLabelFill(fill, 0.12)];
  }
  if (style === "pointedArcs" || style === "circle" || style === "rectangle") {
    return [fill, darkenComicLabelFill(fill)];
  }
  return [fill];
}

export function buildComicLabelBubbleSpec(
  element: HTMLElement,
  style: ComicBubbleStyle,
  getDefault: (el: HTMLElement, bubbleStyle: string) => BubbleSpec,
  options: { fill: string },
): BubbleSpec {
  const fill = options.fill;
  const base = buildBubbleSpec(element, style, getDefault, {
    backgroundColors: comicLabelBackgroundColors(fill, style),
  });

  if (!styleUsesTail(style)) {
    return { ...base, tails: [] };
  }

  return base;
}
