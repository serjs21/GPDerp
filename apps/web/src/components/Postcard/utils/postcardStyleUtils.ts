import type { CSSProperties } from "react";
import {
  POSTCARD_HEIGHT,
  POSTCARD_LANTERN_TOP_PX,
  POSTCARD_LANTERN_WIDTH_PX,
  POSTCARD_WIDTH,
} from "../consts/postcardConsts";
import type { PostcardTextSizes } from "./postcardTextFit";

export function buildPostcardRootStyle(sceneVars: Record<string, string>): CSSProperties {
  return {
    ...sceneVars,
    "--postcard-width": `${POSTCARD_WIDTH}px`,
    "--postcard-height": `${POSTCARD_HEIGHT}px`,
    "--postcard-lantern-top": `${POSTCARD_LANTERN_TOP_PX}px`,
  } as CSSProperties;
}

export function buildPostcardLanternStyle(): CSSProperties {
  return { "--lantern-width": `${POSTCARD_LANTERN_WIDTH_PX}px` } as CSSProperties;
}

export function buildPostcardTextStyle(sizes: PostcardTextSizes): CSSProperties {
  return {
    "--postcard-body-size": `${sizes.bodyPx}px`,
    "--postcard-title-size": `${sizes.titlePx}px`,
    "--postcard-author-size": `${sizes.authorPx}px`,
  } as CSSProperties;
}

export function buildPostcardPreviewStyle(scale: number): CSSProperties {
  return {
    "--postcard-preview-scale": String(scale),
    "--postcard-width": `${POSTCARD_WIDTH}px`,
    "--postcard-height": `${POSTCARD_HEIGHT}px`,
  } as CSSProperties;
}
