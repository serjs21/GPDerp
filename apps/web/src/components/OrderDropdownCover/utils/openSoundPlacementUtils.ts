import type { CSSProperties } from "react";
import {
  GAVEL_BASE_LEFT_RATIO,
  GAVEL_BASE_VIEWBOX,
  GAVEL_VIEWBOX,
  OPEN_SOUND_FADE_MS,
  OPEN_SOUND_GAP,
  OPEN_SOUND_HOLD_MS,
  OPEN_SOUND_NEAR,
  OPEN_SOUND_PLACEMENT_ATTEMPTS,
  OPEN_SOUND_VIEWBOX,
  OPEN_SOUND_WIDTH,
  ORDER_DROPDOWN_COVER_STAGE,
} from "../consts/orderDropdownCoverConsts";
import { coverLabelBox, scaleArtPoint } from "./orderDropdownCoverUtils";

/** Centre (stage units) and clockwise rotation of one sound effect. */
export type OpenSoundPlacement = { cx: number; cy: number; deg: number };

type Point = { x: number; y: number };

const SOUND_WIDTH = OPEN_SOUND_WIDTH;
const SOUND_HEIGHT = (OPEN_SOUND_WIDTH * OPEN_SOUND_VIEWBOX.height) / OPEN_SOUND_VIEWBOX.width;

/** Corners of a w×h rectangle centred on (cx, cy), rotated clockwise (CSS `rotate`) by `rad`. */
function rectCorners(cx: number, cy: number, w: number, h: number, rad: number): Point[] {
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return [
    [-w / 2, -h / 2],
    [w / 2, -h / 2],
    [w / 2, h / 2],
    [-w / 2, h / 2],
  ].map(([x, y]) => ({ x: cx + x * cos - y * sin, y: cy + x * sin + y * cos }));
}

/** Separating-axis test for two convex polygons. */
function polygonsOverlap(a: Point[], b: Point[]): boolean {
  for (const polygon of [a, b]) {
    for (let i = 0; i < polygon.length; i += 1) {
      const p = polygon[i];
      const q = polygon[(i + 1) % polygon.length];
      const axis = { x: p.y - q.y, y: q.x - p.x };
      const project = (points: Point[]) => points.map((pt) => pt.x * axis.x + pt.y * axis.y);
      const pa = project(a);
      const pb = project(b);
      if (Math.max(...pa) < Math.min(...pb) || Math.max(...pb) < Math.min(...pa)) return false;
    }
  }
  return true;
}

const LABEL_BOX = coverLabelBox();
const LABEL_BOX_POLYGON = rectCorners(
  (LABEL_BOX.left + LABEL_BOX.right) / 2,
  (LABEL_BOX.top + LABEL_BOX.bottom) / 2,
  LABEL_BOX.right - LABEL_BOX.left,
  LABEL_BOX.bottom - LABEL_BOX.top,
  0,
);

/** Struck gavel + base as drawn: scaled about the label centre, then cropped by the label. */
const BASE_LEFT = ORDER_DROPDOWN_COVER_STAGE.width * GAVEL_BASE_LEFT_RATIO;
const ART_TOP_LEFT = scaleArtPoint({ x: Math.min(0, BASE_LEFT), y: 0 });
const ART_BOTTOM_RIGHT = scaleArtPoint({
  x: Math.max(GAVEL_VIEWBOX.width, BASE_LEFT + GAVEL_BASE_VIEWBOX.width),
  y: ORDER_DROPDOWN_COVER_STAGE.height,
});
const VISIBLE_ART = {
  left: Math.max(ART_TOP_LEFT.x, LABEL_BOX.left),
  top: Math.max(ART_TOP_LEFT.y, LABEL_BOX.top),
  right: Math.min(ART_BOTTOM_RIGHT.x, LABEL_BOX.right),
  bottom: Math.min(ART_BOTTOM_RIGHT.y, LABEL_BOX.bottom),
};

const nearestArtPoint = (p: Point): Point => ({
  x: Math.min(Math.max(p.x, VISIBLE_ART.left), VISIBLE_ART.right),
  y: Math.min(Math.max(p.y, VISIBLE_ART.top), VISIBLE_ART.bottom),
});

/** Keeps lettering readable: turns a placement half a turn when it would be upside down. */
const uprightDeg = (deg: number) => {
  if (deg > 90) return deg - 180;
  if (deg < -90) return deg + 180;
  return deg;
};

const placementPolygon = (placement: OpenSoundPlacement, inflate = 0) =>
  rectCorners(
    placement.cx,
    placement.cy,
    SOUND_WIDTH + inflate * 2,
    SOUND_HEIGHT + inflate * 2,
    (placement.deg * Math.PI) / 180,
  );

/**
 * Random spot left of the label, within its height, rotated so the sound effect's bottom
 * (or top, when the bottom would leave it upside down) faces the nearest point of the
 * struck gavel and base. Keeps OPEN_SOUND_GAP from the label and from every `existing`
 * effect; null when no free spot was found.
 */
export function pickOpenSoundPlacement(
  existing: OpenSoundPlacement[],
  random: () => number = Math.random,
): OpenSoundPlacement | null {
  const reach = SOUND_HEIGHT / 2 + OPEN_SOUND_GAP + OPEN_SOUND_NEAR;
  for (let attempt = 0; attempt < OPEN_SOUND_PLACEMENT_ATTEMPTS; attempt += 1) {
    const center = {
      x: LABEL_BOX.left - reach + random() * reach,
      y: LABEL_BOX.top + random() * (LABEL_BOX.bottom - LABEL_BOX.top),
    };
    const target = nearestArtPoint(center);
    const dx = target.x - center.x;
    const dy = target.y - center.y;
    // CSS rotate(θ) turns the local "down" (0, 1) into (-sin θ, cos θ); aim it at the target.
    const deg = uprightDeg((Math.atan2(-dx, dy) * 180) / Math.PI);
    const placement = { cx: center.x, cy: center.y, deg };
    const footprint = placementPolygon(placement, OPEN_SOUND_GAP);
    if (polygonsOverlap(footprint, LABEL_BOX_POLYGON)) continue;
    if (existing.some((other) => polygonsOverlap(footprint, placementPolygon(other)))) continue;
    return placement;
  }
  return null;
}

const rem = (value: number) => `${value}rem`;

export function buildOpenSoundStyle(placement: OpenSoundPlacement, widthRem: number): CSSProperties {
  const scale = widthRem / ORDER_DROPDOWN_COVER_STAGE.width;
  return {
    "--odc-sound-left": rem((placement.cx - SOUND_WIDTH / 2) * scale),
    "--odc-sound-top": rem((placement.cy - SOUND_HEIGHT / 2) * scale),
    "--odc-sound-width": rem(SOUND_WIDTH * scale),
    "--odc-sound-height": rem(SOUND_HEIGHT * scale),
    "--odc-sound-rotate": `${placement.deg}deg`,
    "--odc-sound-hold-ms": `${OPEN_SOUND_HOLD_MS}ms`,
    "--odc-sound-fade-ms": `${OPEN_SOUND_FADE_MS}ms`,
  } as CSSProperties;
}
