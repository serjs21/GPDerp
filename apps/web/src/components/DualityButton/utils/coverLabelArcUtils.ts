import {
  COVER_LABEL_ARC_CENTER_DEG,
  COVER_LABEL_ARC_GAP_REM,
  COVER_LABEL_ARC_SPAN_DEG,
  COVER_LABEL_ARROW_BEHIND_DEG,
  COVER_LABEL_ARROW_REST_DEG,
  COVER_LABEL_CHAR_EM,
  COVER_LABEL_FONT_MAX_REM,
  COVER_LABEL_FONT_MIN_REM,
  COVER_LABEL_TITLE_PUSH_DEG,
  DUALITY_BUTTON_SIZE_REM,
} from "../consts/dualityButtonConsts";

/**
 * Per-character CSS angles (deg) along a circular arc around the face center.
 * 0° = 12 o'clock with radial `translateY(-R)`; negative fans toward 9 o'clock.
 * Span is fixed so long titles stay on the top rim (same circle radius).
 */
export function coverLabelCharAngles(
  charCount: number,
  centerDeg = COVER_LABEL_ARC_CENTER_DEG,
  spanDeg = COVER_LABEL_ARC_SPAN_DEG,
): number[] {
  if (charCount <= 0) return [];
  if (charCount === 1) return [centerDeg];
  const step = spanDeg / (charCount - 1);
  const start = centerDeg - spanDeg / 2;
  return Array.from({ length: charCount }, (_, i) => start + i * step);
}

/** Angle of the first title character (leading edge of the arc). */
export function coverLabelTitleStartDeg(
  charCount: number,
  centerDeg = COVER_LABEL_ARC_CENTER_DEG,
  spanDeg = COVER_LABEL_ARC_SPAN_DEG,
): number {
  const angles = coverLabelCharAngles(charCount, centerDeg, spanDeg);
  return angles[0] ?? centerDeg;
}

/**
 * Covered-state arrow angle: just behind the first title char on the same track.
 * More negative = further CCW (behind when reading CW).
 */
export function coverLabelArrowStartDeg(
  charCount: number,
  behindDeg = COVER_LABEL_ARROW_BEHIND_DEG,
): number {
  return coverLabelTitleStartDeg(charCount) - behindDeg;
}

export function coverLabelArrowRestDeg(
  restDeg = COVER_LABEL_ARROW_REST_DEG,
): number {
  return restDeg;
}

export function coverLabelTitlePushDeg(
  pushDeg = COVER_LABEL_TITLE_PUSH_DEG,
): number {
  return pushDeg;
}

/**
 * Font size that fits `charCount` glyphs on the concentric title arc.
 */
export function coverLabelFontSizeRem(
  charCount: number,
  faceSizeRem = DUALITY_BUTTON_SIZE_REM,
  gapRem = COVER_LABEL_ARC_GAP_REM,
  spanDeg = COVER_LABEL_ARC_SPAN_DEG,
): number {
  if (charCount <= 0) return COVER_LABEL_FONT_MAX_REM;
  const radiusRem = faceSizeRem / 2 + gapRem;
  const arcRem = radiusRem * ((spanDeg * Math.PI) / 180);
  const fit = arcRem / (charCount * COVER_LABEL_CHAR_EM);
  return Math.min(
    COVER_LABEL_FONT_MAX_REM,
    Math.max(COVER_LABEL_FONT_MIN_REM, fit),
  );
}

/** One font size for a set of titles, fitted to the longest so every title matches. */
export function coverLabelSharedFontSizeRem(
  titles: readonly string[],
  faceSizeRem = DUALITY_BUTTON_SIZE_REM,
): number {
  const maxChars = titles.reduce((max, title) => Math.max(max, Array.from(title).length), 0);
  return coverLabelFontSizeRem(maxChars, faceSizeRem);
}
