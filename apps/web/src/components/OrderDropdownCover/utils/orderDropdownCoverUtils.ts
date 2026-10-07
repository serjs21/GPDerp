import type { CSSProperties } from "react";
import {
  GAVEL_BASE_LEFT_RATIO,
  GAVEL_BASE_VIEWBOX,
  GAVEL_PIVOT,
  GAVEL_RAISED_DEG,
  GAVEL_RETURN_MS,
  GAVEL_STRIKE_MS,
  GAVEL_VIEWBOX,
  ORDER_COVER_ART_EDGE_MARGIN,
  ORDER_COVER_ART_SCALE,
  ORDER_COVER_LABEL_PAD_RATIO,
  ORDER_COVER_LABEL_STROKE_WIDTH,
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

/**
 * Button padding (stage units) around the stage: raised-gavel headroom plus the label gap,
 * with the shorter side padded out evenly so the label box is square.
 */
export function coverLabelPadding(): Insets {
  const overflow = raisedGavelOverflow();
  const gap = ORDER_DROPDOWN_COVER_STAGE.width * ORDER_COVER_LABEL_PAD_RATIO;
  const width = ORDER_DROPDOWN_COVER_STAGE.width + overflow.left + overflow.right + gap * 2;
  const height = ORDER_DROPDOWN_COVER_STAGE.height + overflow.top + overflow.bottom + gap * 2;
  const extraX = Math.max(0, height - width) / 2;
  const extraY = Math.max(0, width - height) / 2;
  return {
    top: overflow.top + gap + extraY,
    right: overflow.right + gap + extraX,
    bottom: overflow.bottom + gap + extraY,
    left: overflow.left + gap + extraX,
  };
}

/** Square label box edges in stage coordinates (the stage origin is the struck gavel's top-left). */
export function coverLabelBox() {
  const padding = coverLabelPadding();
  return {
    left: -padding.left,
    top: -padding.top,
    right: ORDER_DROPDOWN_COVER_STAGE.width + padding.right,
    bottom: ORDER_DROPDOWN_COVER_STAGE.height + padding.bottom,
  };
}

/** Centre of the label box (stage coordinates); the gavel art scales about this point. */
export function coverArtOrigin() {
  const box = coverLabelBox();
  return { x: (box.left + box.right) / 2, y: (box.top + box.bottom) / 2 };
}

const scaleAboutOrigin = (point: { x: number; y: number }) => {
  const origin = coverArtOrigin();
  return {
    x: origin.x + (point.x - origin.x) * ORDER_COVER_ART_SCALE,
    y: origin.y + (point.y - origin.y) * ORDER_COVER_ART_SCALE,
  };
};

/** Shift between two bounds `[min, max]` needed to bring `[start, end]` inside them (0 when it already fits). */
const shiftInto = (start: number, end: number, min: number, max: number) => {
  if (start < min) return min - start;
  if (end > max) return max - end;
  return 0;
};

/**
 * Translation (stage units) applied after scaling so the whole base sits inside the
 * label, ORDER_COVER_ART_EDGE_MARGIN away from its edges; the gavel may still overflow.
 */
export function coverArtOffset() {
  const box = coverLabelBox();
  const baseLeft = ORDER_DROPDOWN_COVER_STAGE.width * GAVEL_BASE_LEFT_RATIO;
  const topLeft = scaleAboutOrigin({ x: baseLeft, y: GAVEL_VIEWBOX.height });
  const bottomRight = scaleAboutOrigin({
    x: baseLeft + GAVEL_BASE_VIEWBOX.width,
    y: GAVEL_VIEWBOX.height + GAVEL_BASE_VIEWBOX.height,
  });
  const margin = ORDER_COVER_ART_EDGE_MARGIN;
  return {
    x: shiftInto(topLeft.x, bottomRight.x, box.left + margin, box.right - margin),
    y: shiftInto(topLeft.y, bottomRight.y, box.top + margin, box.bottom - margin),
  };
}

/** Where a stage point is drawn once the art is scaled and shifted. */
export function scaleArtPoint(point: { x: number; y: number }) {
  const scaled = scaleAboutOrigin(point);
  const offset = coverArtOffset();
  return { x: scaled.x + offset.x, y: scaled.y + offset.y };
}

const rem = (value: number) => `${value}rem`;

export function buildOrderDropdownCoverStyle(widthRem: number): CSSProperties {
  const scale = widthRem / ORDER_DROPDOWN_COVER_STAGE.width;
  const padding = coverLabelPadding();
  const artOrigin = coverArtOrigin();
  const artOffset = coverArtOffset();
  return {
    "--odc-art-scale": String(ORDER_COVER_ART_SCALE),
    "--odc-art-shift-x": rem(artOffset.x * scale),
    "--odc-art-shift-y": rem(artOffset.y * scale),
    "--odc-base-left": `${GAVEL_BASE_LEFT_RATIO * 100}%`,
    "--odc-art-origin-x": rem(artOrigin.x * scale),
    "--odc-art-origin-y": rem(artOrigin.y * scale),
    "--odc-label-stroke": `${ORDER_COVER_LABEL_STROKE_WIDTH}px`,
    "--odc-stage-width": rem(widthRem),
    "--odc-stage-height": rem(ORDER_DROPDOWN_COVER_STAGE.height * scale),
    "--odc-gavel-height": rem(GAVEL_VIEWBOX.height * scale),
    "--odc-base-top": rem(GAVEL_VIEWBOX.height * scale),
    "--odc-base-width": rem(GAVEL_BASE_VIEWBOX.width * scale),
    "--odc-base-height": rem(GAVEL_BASE_VIEWBOX.height * scale),
    "--odc-pad-top": rem(padding.top * scale),
    "--odc-pad-right": rem(padding.right * scale),
    "--odc-pad-bottom": rem(padding.bottom * scale),
    "--odc-pad-left": rem(padding.left * scale),
    "--odc-origin-x": `${(GAVEL_PIVOT.x / GAVEL_VIEWBOX.width) * 100}%`,
    "--odc-origin-y": `${(GAVEL_PIVOT.y / GAVEL_VIEWBOX.height) * 100}%`,
    "--odc-raised-deg": `${GAVEL_RAISED_DEG}deg`,
    "--odc-strike-ms": `${GAVEL_STRIKE_MS}ms`,
    "--odc-return-ms": `${GAVEL_RETURN_MS}ms`,
  } as CSSProperties;
}
