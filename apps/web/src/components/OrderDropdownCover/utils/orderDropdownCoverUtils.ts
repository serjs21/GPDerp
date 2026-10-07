import type { CSSProperties } from "react";
import {
  GAVEL_BASE_VIEWBOX,
  GAVEL_PIVOT,
  GAVEL_RAISED_DEG,
  GAVEL_RETURN_MS,
  GAVEL_STRIKE_MS,
  GAVEL_VIEWBOX,
  ORDER_COVER_LABEL_PAD_RATIO,
  ORDER_DROPDOWN_COVER_STAGE,
} from "../consts/orderDropdownCoverConsts";

type Insets = { top: number; right: number; bottom: number; left: number };

/**
 * How far (stage units) the raised gavel sticks out of the stage on each side,
 * from its four corners rotated clockwise around the pivot.
 */
export function raisedGavelOverflow(deg = GAVEL_RAISED_DEG): Insets {
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const corners = [
    [0, 0],
    [GAVEL_VIEWBOX.width, 0],
    [0, GAVEL_VIEWBOX.height],
    [GAVEL_VIEWBOX.width, GAVEL_VIEWBOX.height],
  ].map(([x, y]) => {
    const dx = x - GAVEL_PIVOT.x;
    const dy = y - GAVEL_PIVOT.y;
    return { x: GAVEL_PIVOT.x + dx * cos - dy * sin, y: GAVEL_PIVOT.y + dx * sin + dy * cos };
  });
  const xs = corners.map((c) => c.x);
  const ys = corners.map((c) => c.y);
  return {
    top: Math.max(0, -Math.min(...ys)),
    right: Math.max(0, Math.max(...xs) - ORDER_DROPDOWN_COVER_STAGE.width),
    bottom: Math.max(0, Math.max(...ys) - ORDER_DROPDOWN_COVER_STAGE.height),
    left: Math.max(0, -Math.min(...xs)),
  };
}

const rem = (value: number) => `${value}rem`;

export function buildOrderDropdownCoverStyle(widthRem: number): CSSProperties {
  const scale = widthRem / ORDER_DROPDOWN_COVER_STAGE.width;
  const overflow = raisedGavelOverflow();
  return {
    "--odc-stage-width": rem(widthRem),
    "--odc-stage-height": rem(ORDER_DROPDOWN_COVER_STAGE.height * scale),
    "--odc-gavel-height": rem(GAVEL_VIEWBOX.height * scale),
    "--odc-base-top": rem(GAVEL_VIEWBOX.height * scale),
    "--odc-base-width": rem(GAVEL_BASE_VIEWBOX.width * scale),
    "--odc-base-height": rem(GAVEL_BASE_VIEWBOX.height * scale),
    "--odc-pad-top": rem(overflow.top * scale),
    "--odc-pad-right": rem(overflow.right * scale),
    "--odc-pad-bottom": rem(overflow.bottom * scale),
    "--odc-pad-left": rem(overflow.left * scale),
    "--odc-label-pad": rem(widthRem * ORDER_COVER_LABEL_PAD_RATIO),
    "--odc-origin-x": `${(GAVEL_PIVOT.x / GAVEL_VIEWBOX.width) * 100}%`,
    "--odc-origin-y": `${(GAVEL_PIVOT.y / GAVEL_VIEWBOX.height) * 100}%`,
    "--odc-raised-deg": `${GAVEL_RAISED_DEG}deg`,
    "--odc-strike-ms": `${GAVEL_STRIKE_MS}ms`,
    "--odc-return-ms": `${GAVEL_RETURN_MS}ms`,
  } as CSSProperties;
}
