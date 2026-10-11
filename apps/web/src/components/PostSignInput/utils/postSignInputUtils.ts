import type { CSSProperties } from "react";
import styles from "../PostSignInput.module.css";

export function postSignRootClassName(sticky: boolean): string {
  return [styles.root, sticky && styles.rootSticky].filter(Boolean).join(" ");
}

/** Sign width, plus the pinned bottom offset (riding above the footer) when sticky. */
export function postSignRootStyle(params: {
  widthRem: number;
  sticky: boolean;
  stickyBottomPx: number;
  stickyStopMarginPx: number;
  footerClearancePx: number;
}): CSSProperties {
  const { widthRem, sticky, stickyBottomPx, stickyStopMarginPx, footerClearancePx } = params;
  return {
    "--post-sign-input-width": `${widthRem}rem`,
    ...(sticky
      ? { "--post-sign-sticky-bottom": `${stickyBottomPx + stickyStopMarginPx + footerClearancePx}px` }
      : {}),
  } as CSSProperties;
}
