import type { CSSProperties } from "react";
import {
  POSTCARD_MESSAGE_BOX_HEIGHT_PX,
  POSTCARD_MESSAGE_BOX_WIDTH_PX,
  POSTCARD_MESSAGE_FONT_FAMILY,
  POSTCARD_MESSAGE_FONT_PX,
  POSTCARD_MESSAGE_LINE_HEIGHT_PX,
} from "../consts/postcardMessageConsts";
import { POSTCARD_HEIGHT, POSTCARD_WIDTH } from "../consts/postcardConsts";

export function buildPostcardMessageRootStyle(): CSSProperties {
  return {
    "--postcard-width": `${POSTCARD_WIDTH}px`,
    "--postcard-height": `${POSTCARD_HEIGHT}px`,
    "--postcard-message-width": `${POSTCARD_MESSAGE_BOX_WIDTH_PX}px`,
    "--postcard-message-height": `${POSTCARD_MESSAGE_BOX_HEIGHT_PX}px`,
    "--postcard-message-font": `${POSTCARD_MESSAGE_FONT_PX}px`,
    "--postcard-message-line": `${POSTCARD_MESSAGE_LINE_HEIGHT_PX}px`,
    "--postcard-message-family": POSTCARD_MESSAGE_FONT_FAMILY,
  } as CSSProperties;
}

/** Inline styles for the hidden fit-measurement element (mirrors `.message`). */
export function buildPostcardMessageMeasureStyle(): Partial<CSSStyleDeclaration> {
  return {
    position: "fixed",
    left: "-10000px",
    top: "0",
    visibility: "hidden",
    pointerEvents: "none",
    boxSizing: "border-box",
    width: `${POSTCARD_MESSAGE_BOX_WIDTH_PX}px`,
    height: "auto",
    margin: "0",
    padding: "0",
    fontFamily: POSTCARD_MESSAGE_FONT_FAMILY,
    fontSize: `${POSTCARD_MESSAGE_FONT_PX}px`,
    fontWeight: "400",
    lineHeight: `${POSTCARD_MESSAGE_LINE_HEIGHT_PX}px`,
    letterSpacing: "normal",
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  };
}
