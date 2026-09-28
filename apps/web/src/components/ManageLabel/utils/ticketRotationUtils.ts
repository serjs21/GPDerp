import type { CSSProperties } from "react";
import {
  TICKET_INSET_RATIO,
  TICKET_MAX_ANGLE_DEG,
  TICKET_MAX_THICKNESS_REM,
  TICKET_ROOT_FONT_PX,
  TICKET_THICKNESS_RATIO,
} from "../consts/ticketRotationConsts";

export type TicketFaceGeometry = {
  angleDeg: number;
  lengthPx: number;
  thicknessPx: number;
};

/** Below this, sin/cos of the angle is treated as 0 so that axis does not constrain length. */
const TRIG_EPSILON = 1e-6;

/**
 * Smooth rotation from the stage aspect ratio r = height / width:
 * r <= 0.5 -> 0deg, r = 1 -> 45deg, r >= 2 -> 90deg (log2 curve between).
 */
export function ticketRotationDeg(width: number, height: number): number {
  if (width <= 0 || height <= 0) return 0;
  const angle = (TICKET_MAX_ANGLE_DEG / 2) * (1 + Math.log2(height / width));
  return Math.min(TICKET_MAX_ANGLE_DEG, Math.max(0, angle));
}

/** Largest ticket (length x thickness) that fits the stage once rotated. Null until measured. */
export function ticketFaceGeometry(width: number, height: number): TicketFaceGeometry | null {
  if (width <= 0 || height <= 0) return null;

  const angleDeg = ticketRotationDeg(width, height);
  const rad = (angleDeg * Math.PI) / 180;
  const sin = Math.sin(rad);
  const cos = Math.cos(rad);

  const thicknessPx = Math.min(
    TICKET_MAX_THICKNESS_REM * TICKET_ROOT_FONT_PX,
    TICKET_THICKNESS_RATIO * Math.min(width, height),
  );
  const availableW = TICKET_INSET_RATIO * width;
  const availableH = TICKET_INSET_RATIO * height;

  const fits: number[] = [];
  if (cos > TRIG_EPSILON) fits.push((availableW - thicknessPx * sin) / cos);
  if (sin > TRIG_EPSILON) fits.push((availableH - thicknessPx * cos) / sin);
  const lengthPx = Math.max(thicknessPx, Math.min(...fits));

  return { angleDeg, lengthPx, thicknessPx };
}

/** CSS vars consumed by `.ticketFace`; undefined keeps the CSS fallbacks (unrotated). */
export function buildTicketFaceStyle(
  geometry: TicketFaceGeometry | null,
): CSSProperties | undefined {
  if (!geometry) return undefined;
  return {
    "--ticket-angle": `${geometry.angleDeg}deg`,
    "--ticket-length": `${geometry.lengthPx}px`,
    "--ticket-thickness": `${geometry.thicknessPx}px`,
  } as CSSProperties;
}
