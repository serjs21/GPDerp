import type { CSSProperties } from "react";
import {
  TICKET_ASPECT_RATIO,
  TICKET_INSET_RATIO,
  TICKET_MAX_ANGLE_DEG,
  TICKET_MAX_THICKNESS_REM,
  TICKET_ROOT_FONT_PX,
} from "../consts/ticketRotationConsts";

export type TicketFaceGeometry = {
  angleDeg: number;
  lengthPx: number;
  thicknessPx: number;
};

/**
 * Smooth rotation from the stage aspect ratio r = height / width:
 * r <= 0.5 -> 0deg, r = 1 -> 45deg, r >= 2 -> 90deg (log2 curve between).
 */
export function ticketRotationDeg(width: number, height: number): number {
  if (width <= 0 || height <= 0) return 0;
  const angle = (TICKET_MAX_ANGLE_DEG / 2) * (1 + Math.log2(height / width));
  return Math.min(TICKET_MAX_ANGLE_DEG, Math.max(0, angle));
}

/**
 * Largest ticket at the SVG's own aspect ratio that fits the stage once rotated.
 * The rotated bounding box is T*(R*cos + sin) wide and T*(R*sin + cos) tall (R = length / thickness).
 * Null until measured.
 */
export function ticketFaceGeometry(width: number, height: number): TicketFaceGeometry | null {
  if (width <= 0 || height <= 0) return null;

  const angleDeg = ticketRotationDeg(width, height);
  const rad = (angleDeg * Math.PI) / 180;
  const sin = Math.sin(rad);
  const cos = Math.cos(rad);
  const ratio = TICKET_ASPECT_RATIO;

  const thicknessPx = Math.min(
    TICKET_MAX_THICKNESS_REM * TICKET_ROOT_FONT_PX,
    (TICKET_INSET_RATIO * width) / (ratio * cos + sin),
    (TICKET_INSET_RATIO * height) / (ratio * sin + cos),
  );

  return { angleDeg, lengthPx: thicknessPx * ratio, thicknessPx };
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
