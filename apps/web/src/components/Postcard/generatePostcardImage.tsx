"use client";

import type { HaikuDto } from "@/api/haikus";
import { PostcardRenderer } from "./PostcardRenderer";
import type { PostcardRendererProps } from "./PostcardRenderer.types";
import type { PostcardTheme } from "./utils/postcardTheme";
import { renderOffscreenImage } from "./utils/renderOffscreenImage";

export type GeneratePostcardImageInput = {
  theme: PostcardTheme;
  haiku: HaikuDto;
  getAriaLabel: PostcardRendererProps["getAriaLabel"];
  fontScale?: number;
};

/**
 * Render the postcard front offscreen and capture it as a 1200×800 JPEG (2× pixel ratio).
 * Client-only; rejects when an asset fails to load or capture returns nothing.
 */
export function generatePostcardImage({
  theme,
  haiku,
  getAriaLabel,
  fontScale,
}: GeneratePostcardImageInput): Promise<Blob> {
  return renderOffscreenImage(
    <PostcardRenderer theme={theme} haiku={haiku} getAriaLabel={getAriaLabel} fontScale={fontScale} />,
  );
}
