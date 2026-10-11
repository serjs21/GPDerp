import type { CSSProperties } from "react";
import type { DualityFaceIconPosition } from "../DualityFaceIcon.types";

export function dualityIconPositionClass(
  styles: Record<string, string>,
  position: DualityFaceIconPosition,
): string {
  if (position === "top") return styles.iconTop;
  if (position === "bottom") return styles.iconBottom;
  return styles.iconCenter;
}

export function dualityIconSizeStyle(scale: number): CSSProperties | undefined {
  if (scale === 1) return undefined;
  return { "--duality-icon-scale": String(scale) } as CSSProperties;
}

export function dualityMaskIconStyle(sizeStyle: CSSProperties | undefined, src: string): CSSProperties {
  return {
    ...sizeStyle,
    WebkitMaskImage: `url("${src}")`,
    maskImage: `url("${src}")`,
  } as CSSProperties;
}
