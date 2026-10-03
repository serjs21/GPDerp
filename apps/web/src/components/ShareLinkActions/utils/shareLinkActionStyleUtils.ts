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
    [`${prefix}-caption-top`]: caption.top ?? "auto",
    [`${prefix}-caption-bottom`]: caption.bottom ?? "auto",
    [`${prefix}-caption-right`]: caption.right ?? "auto",
    [`${prefix}-caption-left`]: caption.left ?? "auto",
    [`${prefix}-caption-rotate`]: `${caption.rotateDeg}deg`,
    ...(caption.fontSize ? { [`${prefix}-caption-font-size`]: caption.fontSize } : {}),
  } as CSSProperties;
}

export function shareLinkActionRowLayoutStyle(layout: ShareLinkActionLayout | undefined): CSSProperties {
  return layout ? shareLinkActionLayoutStyle(layout, "--share-link-action-row") : {};
}
