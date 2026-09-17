/**
 * Content-face transforms for rotated lantern base assets.
 * Default panel size follows upright lantern text insets; variants may override
 * width/height % and `contentScale`. Angles match the painted paper face
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
  /** Content box size as % of frame (default = upright lantern text panel). */
  contentWidthPct: number;
  contentHeightPct: number;
  /** Uniform scale applied after rotate/skew. */
  contentScale: number;
  /** Face match — applied as rotate() then skewX() skewY() then scale(). */
  rotateDeg: number;
  skewXDeg: number;
  skewYDeg: number;
  /** Optional CSS flame glow; omit when the PNG already paints the light. */
  flameBottom?: number;
  flameHeight?: number;
};

/** Same inset fractions as upright lantern `.content` (Lantern.module.css). */
export const LANTERN_ROTATED_CONTENT_INSET = LANTERN_TEXT_INSET;

export const LANTERN_ROTATED_CONTENT_WIDTH_PCT =
  (1 - LANTERN_TEXT_INSET.left - LANTERN_TEXT_INSET.right) * 100;

export const LANTERN_ROTATED_CONTENT_HEIGHT_PCT =
  (1 - LANTERN_TEXT_INSET.top - LANTERN_TEXT_INSET.bottom) * 100;

export const LANTERN_ROTATED_WIDTH_REM = 14;

/**
 * `lantern_base_rotated.png` — shared with AuthLanterns.
 * Auth label sits ~68%/39% with tilt 17° / skewX 25°; haiku panel anchors on the same face.
 */
const ROTATED: LanternRotatedContentTransform = {
  assetSrc: "/lantern/lantern_base_rotated.png",
  imageWidth: 350,
  imageHeight: 383,
  contentLeftPct: 68,
  contentTopPct: 45,
  contentWidthPct: 92,
  contentHeightPct: 88,
  contentScale: 0.65,
  rotateDeg: 22,
  skewXDeg: 24,
  skewYDeg: -6,
};

/**
 * `lanter-base-rotated-2.png` — worm’s-eye base; tuned to face panel in Storybook.
 */
const ROTATED_2: LanternRotatedContentTransform = {
  assetSrc: "/lantern/lanter-base-rotated-2.png",
  imageWidth: 300,
  imageHeight: 380,
  contentLeftPct: 68,
  contentTopPct: 52,
  contentWidthPct: 106,
  contentHeightPct: 69,
  contentScale: 0.63,
  rotateDeg: 28,
  skewXDeg: 30,
  skewYDeg: -7,
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
