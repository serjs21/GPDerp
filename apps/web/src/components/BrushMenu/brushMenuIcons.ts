/** Brush menu option backgrounds from `/public/ink_brush.svg`. */

export const BRUSH_MENU_ICON_SRC = "/ink_brush.svg" as const;

export const BRUSH_MENU_ICON_SRCS = [BRUSH_MENU_ICON_SRC] as const;

export type BrushMenuIconSrc = (typeof BRUSH_MENU_ICON_SRCS)[number];

export function brushMenuIconForIndex(_index: number): BrushMenuIconSrc {
  return BRUSH_MENU_ICON_SRC;
}

/** Shared viewBox for ink_brush.svg. */
export const BRUSH_MENU_ICON_VIEWBOX = "0 0 314 114" as const;
export const BRUSH_MENU_ICON_WIDTH = 314;
export const BRUSH_MENU_ICON_HEIGHT = 114;
