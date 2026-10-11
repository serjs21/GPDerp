import type { CSSProperties } from "react";
import { COVER_ICON_EXIT_MS } from "../consts/dualityButtonConsts";
import { COVER_LAYER_CLASS_KEYS } from "../consts/coverStateConsts";
import { flippedFromTurns } from "./dualityButtonUtils";

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Derived cover/label flags for the current open/close phase. */
export function coverPhaseFlags(uncovered: boolean, opening: boolean, closing: boolean) {
  const settled = !opening && !closing;
  const arrowFollowsBase = uncovered && settled;
  return {
    coverActive: !uncovered && settled,
    faceOpen: uncovered || opening,
    labelExpanded: opening || (uncovered && !closing),
    arrowFollowsBase,
    /** Face ignores input while covered or mid-flip. */
    faceInert: !arrowFollowsBase,
  };
}

/**
 * Label arrow rotation and coin face side. While covering (or covered with a turned base) the face
 * freezes on the base's side so category always-asc does not spin mid-close.
 */
export function coverRotationView(params: {
  uncovered: boolean;
  closing: boolean;
  arrowFollowsBase: boolean;
  baseRotateDeg: number;
  wantFlipped: boolean;
}) {
  const { uncovered, closing, arrowFollowsBase, baseRotateDeg, wantFlipped } = params;
  const freezeCoverFace = closing || (!uncovered && baseRotateDeg !== 0);
  return {
    labelBaseRotateDeg: arrowFollowsBase || freezeCoverFace ? baseRotateDeg : 0,
    coinFaceFlipped: freezeCoverFace ? flippedFromTurns(baseRotateDeg) : wantFlipped,
  };
}

/** Which phase a base-layer animation end completes (both layers share duration; base is the source). */
export function coverLayerAnimationOutcome(
  animationName: string,
  opening: boolean,
  closing: boolean,
): "open" | "close" | null {
  const name = animationName.toLowerCase();
  if (!name.includes("coverbase")) return null;
  if (opening && name.includes("open")) return "open";
  if (closing && name.includes("close")) return "close";
  return null;
}

export function coverLayerClassName(
  styles: Record<string, string>,
  layer: keyof typeof COVER_LAYER_CLASS_KEYS,
  phase: { opening: boolean; closing: boolean; faceOpen: boolean },
): string {
  const keys = COVER_LAYER_CLASS_KEYS[layer];
  const settledOpen = !phase.opening && !phase.closing && phase.faceOpen;
  return [
    styles.layer,
    styles[keys.layer],
    phase.opening ? styles[keys.opening] : "",
    phase.closing ? styles[keys.closing] : "",
    settledOpen ? styles[keys.open] : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function coverFaceClassName(styles: Record<string, string>, faceInert: boolean): string {
  return [styles.face, faceInert ? styles.faceInert : ""].filter(Boolean).join(" ");
}

export function coverStateRootStyle(style: CSSProperties | undefined, sizeRem: number): CSSProperties {
  return {
    ...style,
    "--duality-face-size": `${sizeRem}rem`,
    "--cover-coin-flip-ms": `${COVER_ICON_EXIT_MS}ms`,
  } as CSSProperties;
}
