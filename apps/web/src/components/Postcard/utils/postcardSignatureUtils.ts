import type { CSSProperties } from "react";
import {
  POSTCARD_MESSAGE_BOX_WIDTH_PX,
  POSTCARD_SIGNATURE_CHAR_WIDTH_EM,
  POSTCARD_SIGNATURE_FONT_PX,
  POSTCARD_SIGNATURE_HEART_FONT_PX,
  POSTCARD_SIGNATURE_HEART_GAP_PX,
  POSTCARD_SIGNATURE_INDENT_PX,
  POSTCARD_SIGNATURE_LONG_MAX_FONT_PX,
  POSTCARD_SIGNATURE_LONG_NAME_CHARS,
  POSTCARD_SIGNATURE_MIN_FONT_PX,
} from "../consts/postcardMessageConsts";

/** Mirrors apps/api src/utils/postcardSignature.ts so the preview matches the emailed back. */
export function buildPostcardSignatureStyle(senderName: string): CSSProperties {
  const name = senderName.trim();
  const isLong = name.length > POSTCARD_SIGNATURE_LONG_NAME_CHARS;
  const indentPx = isLong ? 0 : POSTCARD_SIGNATURE_INDENT_PX;

  const fontPx = isLong
    ? Math.min(
        POSTCARD_SIGNATURE_LONG_MAX_FONT_PX,
        Math.max(
          POSTCARD_SIGNATURE_MIN_FONT_PX,
          Math.floor(
            (POSTCARD_MESSAGE_BOX_WIDTH_PX - POSTCARD_SIGNATURE_HEART_FONT_PX - POSTCARD_SIGNATURE_HEART_GAP_PX) /
              (`From: ${name}`.length * POSTCARD_SIGNATURE_CHAR_WIDTH_EM),
          ),
        ),
      )
    : POSTCARD_SIGNATURE_FONT_PX;
  const heartFontPx = Math.round((fontPx * POSTCARD_SIGNATURE_HEART_FONT_PX) / POSTCARD_SIGNATURE_FONT_PX);

  return {
    "--postcard-signature-indent": `${indentPx}px`,
    "--postcard-signature-font": `${fontPx}px`,
    "--postcard-signature-heart-font": `${heartFontPx}px`,
    "--postcard-signature-gap": `${POSTCARD_SIGNATURE_HEART_GAP_PX}px`,
  } as CSSProperties;
}
