/** Round-robin option backgrounds from `/public/brush_menu`. */

export const BRUSH_MENU_ICON_SRCS = [
  "/brush_menu/brush-stroke-01.svg",
  "/brush_menu/brush-stroke-02.svg",
  "/brush_menu/brush-stroke-03.svg",
] as const;

export type BrushMenuIconSrc = (typeof BRUSH_MENU_ICON_SRCS)[number];

export function brushMenuIconForIndex(index: number): BrushMenuIconSrc {
  const count = BRUSH_MENU_ICON_SRCS.length;
  const safeIndex = ((index % count) + count) % count;
  return BRUSH_MENU_ICON_SRCS[safeIndex]!;
}

/** Shared viewBox for brush_menu stroke SVGs. */
export const BRUSH_MENU_ICON_VIEWBOX = "0 0 240 40" as const;
export const BRUSH_MENU_ICON_WIDTH = 240;
export const BRUSH_MENU_ICON_HEIGHT = 40;

export const BRUSH_MENU_REVEAL_D = `M0 ${BRUSH_MENU_ICON_HEIGHT / 2} H${BRUSH_MENU_ICON_WIDTH}`;
