"use client";

import type { HaikuDto } from "@/api/haikus";
import { PostcardRenderer } from "./PostcardRenderer";
import type { PostcardTheme } from "./utils/postcardTheme";
import { renderOffscreenPng } from "./utils/renderOffscreenPng";

export type GeneratePostcardImageInput = {
  theme: PostcardTheme;
  haiku: HaikuDto;
  fontScale?: number;
};

/**
 * Render the postcard front offscreen and capture it as a 1200×800 PNG (2× pixel ratio).
 * Client-only; rejects when an asset fails to load or capture returns nothing.
 */
export function generatePostcardImage({
  theme,
  haiku,
  fontScale,
}: GeneratePostcardImageInput): Promise<Blob> {
  return renderOffscreenPng(
    <PostcardRenderer theme={theme} haiku={haiku} fontScale={fontScale} />,
  );
}
