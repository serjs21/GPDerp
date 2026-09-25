import type { CSSProperties } from "react";

export type CalloutPosition = {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  transform?: string;
};

export function buildCalloutPositionStyle(
  position?: CalloutPosition,
): CSSProperties | undefined {
  if (position == null) return undefined;
  const style: CSSProperties = {};
  if (position.top != null) style.top = position.top;
  if (position.right != null) style.right = position.right;
  if (position.bottom != null) style.bottom = position.bottom;
  if (position.left != null) style.left = position.left;
  if (position.transform != null) style.transform = position.transform;
  return style;
}
