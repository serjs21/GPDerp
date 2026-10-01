import type { CSSProperties } from "react";
import type { ShareLinkActionLayout } from "../ShareLinkActionButton.types";

export function shareLinkActionHoverStyle(hoverFill: string): CSSProperties {
  return { "--share-link-action-hover-fill": hoverFill } as CSSProperties;
}

export function shareLinkActionLayoutStyle({ icon, caption }: ShareLinkActionLayout): CSSProperties {
  return {
    "--share-link-action-icon-size": icon.size,
    "--share-link-action-icon-top": icon.top ?? "auto",
    "--share-link-action-icon-bottom": icon.bottom ?? "auto",
    "--share-link-action-icon-right": icon.right ?? "auto",
    "--share-link-action-icon-left": icon.left ?? "auto",
    "--share-link-action-icon-rotate": `${icon.rotateDeg}deg`,
    "--share-link-action-caption-top": caption.top ?? "auto",
    "--share-link-action-caption-bottom": caption.bottom ?? "auto",
    "--share-link-action-caption-right": caption.right ?? "auto",
    "--share-link-action-caption-left": caption.left ?? "auto",
    "--share-link-action-caption-rotate": `${caption.rotateDeg}deg`,
  } as CSSProperties;
}
