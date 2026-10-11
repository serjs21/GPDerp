import type { CSSProperties } from "react";
import { DUALITY_BUTTON_FLIP_MS } from "../consts/dualityButtonConsts";

export function flippedFromTurns(clockwiseDeg: number): boolean {
  return Math.round(clockwiseDeg / 180) % 2 === 1;
}

export function dualityButtonRootStyle(style: CSSProperties | undefined, clockwiseDeg: number): CSSProperties {
  return {
    ...style,
    "--duality-flip-ms": `${DUALITY_BUTTON_FLIP_MS}ms`,
    "--duality-base-rotate": `${clockwiseDeg}deg`,
  } as CSSProperties;
}

export function dualityButtonClassName(
  styles: Record<string, string>,
  flipped: boolean,
  className: string | undefined,
): string {
  return [styles.root, flipped ? styles.flipped : "", className].filter(Boolean).join(" ");
}
