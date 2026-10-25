import type { CSSProperties } from "react";

/** Same viewport inset as the pinned subject input (PostSignInput's default sticky bottom). */
const VERIFICATION_CTA_BOTTOM_PX = 20;

/** Pinned like the subject input it replaces, riding up while the footer is on screen. */
export function verificationCtaStyle(footerClearancePx: number): CSSProperties {
  return { "--verification-cta-bottom": `${VERIFICATION_CTA_BOTTOM_PX + footerClearancePx}px` } as CSSProperties;
}
