import {
  POSTCARD_AUTHOR_FONT_RATIO,
  POSTCARD_BODY_FONT_PX,
  POSTCARD_BODY_MIN_FONT_PX,
  POSTCARD_LANTERN_CONTENT_WIDTH_RATIO,
  POSTCARD_LANTERN_WIDTH_PX,
  POSTCARD_NARROW_CHAR_EM,
  POSTCARD_TITLE_FONT_RATIO,
  POSTCARD_WIDE_CHAR_EM,
} from "../consts/postcardConsts";

export type PostcardTextSizes = {
  bodyPx: number;
  titlePx: number;
  authorPx: number;
};

const WIDE_CHAR = /[\u1100-\u115f\u2e80-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe30-\ufe4f\uff00-\uff60\uffe0-\uffe6]/;

/** Estimated line width in em units (CJK glyphs are ~1em, latin ~0.56em). */
export function estimateLineEm(line: string): number {
  let em = 0;
  for (const char of line) {
    em += WIDE_CHAR.test(char) ? POSTCARD_WIDE_CHAR_EM : POSTCARD_NARROW_CHAR_EM;
  }
  return em;
}

function fitPx(lineEm: number, availablePx: number, maxPx: number): number {
  if (lineEm <= 0) return maxPx;
  return Math.min(maxPx, Math.floor(availablePx / lineEm));
}

/**
 * Pick body/title/author font sizes so the longest line fits the lantern's
 * text box width. Height is bounded by the base size (3 lines always fit).
 */
export function postcardTextSizes(
  lines: string[],
  title: string | undefined,
  author: string | undefined,
  fontScale = 1,
): PostcardTextSizes {
  const availablePx = POSTCARD_LANTERN_WIDTH_PX * POSTCARD_LANTERN_CONTENT_WIDTH_RATIO * 0.94;
  const baseBody = POSTCARD_BODY_FONT_PX * fontScale;
  const longestEm = Math.max(0, ...lines.map(estimateLineEm));
  const bodyPx = Math.max(POSTCARD_BODY_MIN_FONT_PX, fitPx(longestEm, availablePx, baseBody));

  const titleMax = bodyPx * POSTCARD_TITLE_FONT_RATIO;
  const titlePx = title
    ? Math.max(POSTCARD_BODY_MIN_FONT_PX, fitPx(estimateLineEm(title), availablePx, titleMax))
    : titleMax;

  const authorMax = Math.max(12, bodyPx * POSTCARD_AUTHOR_FONT_RATIO);
  const authorPx = author
    ? Math.max(12, fitPx(estimateLineEm(`—${author}`), availablePx, authorMax))
    : authorMax;

  return { bodyPx, titlePx, authorPx };
}
