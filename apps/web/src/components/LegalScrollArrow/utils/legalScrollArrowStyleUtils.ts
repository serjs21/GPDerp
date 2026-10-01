import type { CSSProperties } from "react";

export function legalScrollArrowStyle(footerVisibleHeightPx: number): CSSProperties {
  return { "--legal-scroll-arrow-lift": `${footerVisibleHeightPx}px` } as CSSProperties;
}
