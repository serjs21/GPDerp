import type { CSSProperties } from "react";

/** Lifts the bottom-right "Created by" toast by the visible footer height. */
export function sharedHaikuCreatedByStyle(footerOverlapPx: number): CSSProperties {
  return { "--shared-haiku-footer-overlap": `${footerOverlapPx}px` } as CSSProperties;
}
