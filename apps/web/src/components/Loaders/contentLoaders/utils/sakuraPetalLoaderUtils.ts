import type { CSSProperties } from "react";

/** Diameter ≈ 2 × (orbit at 1rem + default petal height 0.82rem); fits root.compact 1.5rem box */
const COMPACT_INTRINSIC_DIAMETER_REM = 2 * (1 + 0.82);
const COMPACT_ACTION_ROW_HEIGHT_REM = 1.5;
const COMPACT_FIT_SCALE = COMPACT_ACTION_ROW_HEIGHT_REM / COMPACT_INTRINSIC_DIAMETER_REM;

/** Compact loaders shrink to the action-row height; others scale only when asked. */
export function sakuraLoaderFadeStyle(compact: boolean, scale: number): CSSProperties | undefined {
  if (compact) {
    return { transform: `scale(${COMPACT_FIT_SCALE * scale})`, transformOrigin: "center center" };
  }
  if (scale === 1) return undefined;
  return { transform: `scale(${scale})`, transformOrigin: "center center" };
}
