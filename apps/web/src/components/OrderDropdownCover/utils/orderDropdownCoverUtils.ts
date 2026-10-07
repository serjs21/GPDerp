import type { CSSProperties } from "react";
import {
  GAVEL_BASE_VIEWBOX,
  GAVEL_PIVOT,
  GAVEL_RAISED_DEG,
  GAVEL_RETURN_MS,
  GAVEL_STRIKE_MS,
  GAVEL_HEAD_RIGHT,
  GAVEL_VIEWBOX,
  OPEN_SOUND_FADE_MS,
  OPEN_SOUND_GAP,
  OPEN_SOUND_HOLD_MS,
  OPEN_SOUND_LEFT_MAX_Y,
  OPEN_SOUND_VIEWBOX,
  OPEN_SOUND_WIDTH,
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

export type OpenSoundPosition = { x: number; y: number };

/**
 * Random top-left corner (stage units) for the sound effect, either above the gavel head
 * or left of the gavel. Its box always ends OPEN_SOUND_GAP short of the struck gavel's box.
 */
export function pickOpenSoundPosition(random: () => number = Math.random): OpenSoundPosition {
  const width = OPEN_SOUND_WIDTH;
  const height = (OPEN_SOUND_WIDTH * OPEN_SOUND_VIEWBOX.height) / OPEN_SOUND_VIEWBOX.width;
  if (random() < 0.5) {
    const right = -OPEN_SOUND_GAP + random() * (GAVEL_HEAD_RIGHT + OPEN_SOUND_GAP);
    return { x: right - width, y: -OPEN_SOUND_GAP - height };
  }
  const bottom = -OPEN_SOUND_GAP + random() * (OPEN_SOUND_LEFT_MAX_Y + OPEN_SOUND_GAP);
  return { x: -OPEN_SOUND_GAP - width, y: bottom - height };
}

export function buildOpenSoundStyle(position: OpenSoundPosition, widthRem: number): CSSProperties {
  const scale = widthRem / ORDER_DROPDOWN_COVER_STAGE.width;
  return {
    "--odc-sound-left": rem(position.x * scale),
    "--odc-sound-top": rem(position.y * scale),
    "--odc-sound-width": rem(OPEN_SOUND_WIDTH * scale),
    "--odc-sound-hold-ms": `${OPEN_SOUND_HOLD_MS}ms`,
    "--odc-sound-fade-ms": `${OPEN_SOUND_FADE_MS}ms`,
  } as CSSProperties;
}

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
    "--odc-origin-x": `${(GAVEL_PIVOT.x / GAVEL_VIEWBOX.width) * 100}%`,
    "--odc-origin-y": `${(GAVEL_PIVOT.y / GAVEL_VIEWBOX.height) * 100}%`,
    "--odc-raised-deg": `${GAVEL_RAISED_DEG}deg`,
    "--odc-strike-ms": `${GAVEL_STRIKE_MS}ms`,
    "--odc-return-ms": `${GAVEL_RETURN_MS}ms`,
  } as CSSProperties;
}
