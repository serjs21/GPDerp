/**
 * Content-face transforms for rotated lantern base assets.
 * Panel size matches default lantern text insets ([`LANTERN_TEXT_INSET`](./constants.ts));
 * only `contentScale` changes size. Angles match the painted paper face
 * (same approach as AuthLanterns Login/Register lettering).
 */

import { LANTERN_TEXT_INSET } from "./constants";

export type LanternRotatedVariantId = "rotated" | "rotated2";

export type LanternRotatedContentTransform = {
  assetSrc: string;
  imageWidth: number;
  imageHeight: number;
  /** Content panel anchor as % of frame (transform origin center). */
  contentLeftPct: number;
  contentTopPct: number;
  /** Uniform scale of the default-ratio content panel. */
  contentScale: number;
  /** Face match — applied as rotate() then skewX() then scale(). */
  rotateDeg: number;
  skewXDeg: number;
  /** Optional CSS flame glow; omit when the PNG already paints the light. */
  flameBottom?: number;
  flameHeight?: number;
};

/** Same inset fractions as upright lantern `.content` (Lantern.module.css). */
export const LANTERN_ROTATED_CONTENT_INSET = LANTERN_TEXT_INSET;

export const LANTERN_ROTATED_CONTENT_WIDTH_PCT = 100;

export const LANTERN_ROTATED_CONTENT_HEIGHT_PCT =
  (1 - LANTERN_TEXT_INSET.top - LANTERN_TEXT_INSET.bottom) * 100;

export const LANTERN_ROTATED_WIDTH_REM = 17.5;

/**
 * `lantern_base_rotated.png` — shared with AuthLanterns.
 * Auth label sits ~68%/39% with tilt 17° / skewX 25°; haiku panel anchors on the same face.
 */
const ROTATED: LanternRotatedContentTransform = {
  assetSrc: "/lantern/lantern_base_rotated.png",
  imageWidth: 350,
  imageHeight: 383,
  contentLeftPct: 58,
  contentTopPct: 42,
  contentScale: 0.72,
  rotateDeg: 17,
  skewXDeg: 25,
};

/**
 * `lanter-base-rotated-2.png` — worm’s-eye base; primary readable face is the wider right panel.
 */
const ROTATED_2: LanternRotatedContentTransform = {
  assetSrc: "/lantern/lanter-base-rotated-2.png",
  imageWidth: 300,
  imageHeight: 380,
  contentLeftPct: 63,
  contentTopPct: 50,
  contentScale: 0.62,
  rotateDeg: 24,
  skewXDeg: 34,
};

export const LANTERN_ROTATED_CONTENT = {
  rotated: ROTATED,
  rotated2: ROTATED_2,
} as const satisfies Record<LanternRotatedVariantId, LanternRotatedContentTransform>;

export function lanternRotatedContentTransform(
  variant: LanternRotatedVariantId,
): LanternRotatedContentTransform {
  return LANTERN_ROTATED_CONTENT[variant];
}
