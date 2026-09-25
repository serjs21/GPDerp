import type { CSSProperties } from "react";

export type DateGraffitiPosition = {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  transform?: string;
};

export function buildDateGraffitiStyle(options: {
  color?: string;
  size?: string;
  position?: DateGraffitiPosition;
}): CSSProperties | undefined {
  const { color, size, position } = options;
  if (color == null && size == null && position == null) return undefined;

  const style: CSSProperties = {};
  if (color != null) style.color = color;
  if (size != null) style.fontSize = size;
  if (position != null) {
    if (position.top != null) style.top = position.top;
    if (position.right != null) style.right = position.right;
    if (position.bottom != null) style.bottom = position.bottom;
    if (position.left != null) style.left = position.left;
    if (position.transform != null) style.transform = position.transform;
  }
  return style;
}
