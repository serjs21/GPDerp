import type { CSSProperties } from "react";
import { HAIKU_MAX_LINE_CHARS, parseHaikuBody } from "@/utils/parseHaikuBody";

/** Cursive em-width so a max-length line stays on one row in preview lanterns. */
export const PREVIEW_LANTERN_CHAR_EM = 0.58;

export type PreviewLanternTypographyOptions = {
  /** Optional title length so title ellipsis sizing matches body. */
  title?: string;
  /** Upper clamp for body font size (rem). */
  maxBodyRem?: number;
  /** Upper clamp for title font size (rem). */
  maxTitleRem?: number;
  /** Upper clamp for author font size (rem). */
  maxAuthorRem?: number;
  /** Lower clamp for body font size (rem). */
  minBodyRem?: number;
};

/**
 * Container-query font-size vars so bodyOnly title/body/author fit small preview lanterns.
 * Layout (spacing, line height) comes from the shared `.bodyOnly` styles.
 */
export function buildPreviewLanternTypographyStyle(
  body: string,
  {
    title,
    maxBodyRem = 0.85,
    maxTitleRem = 0.78,
    maxAuthorRem = 0.58,
    minBodyRem = 0.28,
  }: PreviewLanternTypographyOptions = {},
): CSSProperties {
  const longest = Math.max(
    ...parseHaikuBody(body).lines.map((line) => line.length),
    title?.length ?? 0,
    1,
  );
  const fitChars = Math.min(HAIKU_MAX_LINE_CHARS, Math.max(longest, 8));
  const cqi = `100cqi / ${fitChars * PREVIEW_LANTERN_CHAR_EM}`;

  return {
    "--lantern-body-font-size": `clamp(${minBodyRem}rem, calc(${cqi}), ${maxBodyRem}rem)`,
    "--lantern-title-font-size": `clamp(${minBodyRem}rem, calc(${cqi}), ${maxTitleRem}rem)`,
    "--lantern-author-font-size": `clamp(${Math.max(0.2, minBodyRem - 0.06)}rem, calc(${cqi} * 0.85), ${maxAuthorRem}rem)`,
  } as CSSProperties;
}
