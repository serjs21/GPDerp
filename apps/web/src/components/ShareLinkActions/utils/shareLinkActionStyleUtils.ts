import type { CSSProperties } from "react";

export function shareLinkActionHoverStyle(hoverFill: string): CSSProperties {
  return { "--share-link-action-hover-fill": hoverFill } as CSSProperties;
}
