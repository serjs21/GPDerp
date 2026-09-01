import type { BubbleSpec } from "comicaljs";

export type ComicBubbleStyle =
  | "speech"
  | "thought"
  | "pointedArcs"
  | "circle"
  | "caption"
  | "rectangle";

export const COMIC_BUBBLE_STYLES: ComicBubbleStyle[] = [
  "speech",
  "thought",
  "pointedArcs",
  "circle",
  "caption",
  "rectangle",
];

export const COMIC_INK = "#2d2d2d";
export const COMIC_FILL = "#ffffff";
export const COMIC_SHADOW_OFFSET = 4;
/** Shared duration for overlay, content, and CTA motion (200ms). */
export const COMIC_ANIM_MS = 200;
export const COMIC_OVERLAY_MS = COMIC_ANIM_MS;
export const COMIC_CONTENT_ENTER_MS = COMIC_ANIM_MS;
export const COMIC_CTA_ENTER_MS = COMIC_ANIM_MS;
export const COMIC_EASE = "inOutSine";
export const COMIC_CTA_REST_OPACITY = 0.8;
/** Space between question bubble and CTA row. */
export const COMIC_CONTENT_CTA_GAP_REM = 2;
/** Stage inset so canvas art (shadow + jagged edges) is not clipped. */
export const COMIC_PART_STAGE_PADDING = "2.25rem 2rem";
export const COMIC_CONTENT_STAGE_PADDING = "6rem 3.5rem 0.5rem";

/** Styles that ship with a speech tail in comicaljs defaults. */
export function styleUsesTail(style: ComicBubbleStyle): boolean {
  return style === "speech" || style === "thought";
}

export function buildBubbleSpec(
  element: HTMLElement,
  style: ComicBubbleStyle,
  getDefault: (el: HTMLElement, bubbleStyle: string) => BubbleSpec,
  options?: { isQuestion?: boolean; backgroundColors?: string[] },
): BubbleSpec {
  const base = getDefault(element, style);
  const isQuestion = options?.isQuestion ?? false;
  const defaultColors =
    style === "caption" ? base.backgroundColors ?? [COMIC_FILL, "#f0e6d8"] : [COMIC_FILL];
  return {
    ...base,
    backgroundColors: options?.backgroundColors ?? defaultColors,
    shadowOffset: style === "caption" ? (base.shadowOffset ?? COMIC_SHADOW_OFFSET) : COMIC_SHADOW_OFFSET,
    // Question bubbles sit above CTAs — drop tails so outlines don't spike into options.
    tails: isQuestion || !styleUsesTail(style) ? [] : base.tails,
  };
}

export function resolveOptionsLayout(
  layout: "auto" | "row" | "column",
  optionCount: number,
): "row" | "column" {
  if (layout === "auto") return optionCount <= 2 ? "row" : "column";
  return layout;
}
