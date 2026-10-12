import type { CSSProperties } from "react";
import type { ShareLinkActionLayout } from "../ShareLinkActionButton.types";

export function shareLinkActionHoverStyle(hoverFill: string): CSSProperties {
  return { "--share-link-action-hover-fill": hoverFill } as CSSProperties;
}

/**
 * Emits icon/caption placement vars. `prefix` selects the var family:
 * `--share-link-action` (default stack/footer) or `--share-link-action-row`
 * (horizontal strip, consumed only by the row media query).
 */
export function shareLinkActionLayoutStyle(
  { icon, caption }: ShareLinkActionLayout,
  prefix = "--share-link-action",
): CSSProperties {
  return {
    [`${prefix}-icon-size`]: icon.size,
    [`${prefix}-icon-top`]: icon.top ?? "auto",
    [`${prefix}-icon-bottom`]: icon.bottom ?? "auto",
    [`${prefix}-icon-right`]: icon.right ?? "auto",
    [`${prefix}-icon-left`]: icon.left ?? "auto",
    [`${prefix}-icon-rotate`]: `${icon.rotateDeg}deg`,
    ...(icon.height ? { [`${prefix}-icon-height`]: icon.height } : {}),
    [`${prefix}-caption-top`]: caption.top ?? "auto",
    [`${prefix}-caption-bottom`]: caption.bottom ?? "auto",
    [`${prefix}-caption-right`]: caption.right ?? "auto",
    [`${prefix}-caption-left`]: caption.left ?? "auto",
    [`${prefix}-caption-rotate`]: `${caption.rotateDeg}deg`,
    ...captionTextStyle(caption, prefix),
  } as CSSProperties;
}

/** Optional caption text vars; omitted keys keep the stylesheet defaults. */
function captionTextStyle(
  { fontSize, width, textAlign }: ShareLinkActionLayout["caption"],
  prefix: string,
): Record<string, string> {
  return {
    ...(fontSize ? { [`${prefix}-caption-font-size`]: fontSize } : {}),
    ...(width ? { [`${prefix}-caption-width`]: width } : {}),
    ...(textAlign ? { [`${prefix}-caption-text-align`]: textAlign } : {}),
  };
}

/** Overrides the panel accent (sunburst rays / speed lines); hex panel colors otherwise reuse the base. */
export function shareLinkActionAccentStyle(accent: string | undefined): CSSProperties {
  return accent ? ({ "--comic-panel-accent": accent } as CSSProperties) : {};
}

export function shareLinkActionRowLayoutStyle(layout: ShareLinkActionLayout | undefined): CSSProperties {
  return layout ? shareLinkActionLayoutStyle(layout, "--share-link-action-row") : {};
}
