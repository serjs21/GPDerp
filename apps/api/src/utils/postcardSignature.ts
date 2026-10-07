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
} from "../consts/postcard";

export type PostcardSignatureLayout = {
  text: string;
  indentPx: number;
  fontPx: number;
  heartFontPx: number;
  /** Width left for the text after the indent and heart; overflow ellipsizes. */
  textMaxWidthPx: number;
};

/** Mirrors apps/web Postcard/utils/postcardSignatureUtils.ts. */
export function postcardSignatureLayout(senderName: string): PostcardSignatureLayout {
  const name = senderName.trim();
  const text = `From: ${name}`;
  const isLong = name.length > POSTCARD_SIGNATURE_LONG_NAME_CHARS;
  const indentPx = isLong ? 0 : POSTCARD_SIGNATURE_INDENT_PX;

  const fontPx = isLong
    ? Math.min(
        POSTCARD_SIGNATURE_LONG_MAX_FONT_PX,
        Math.max(
          POSTCARD_SIGNATURE_MIN_FONT_PX,
          Math.floor(
            (POSTCARD_MESSAGE_BOX_WIDTH_PX - POSTCARD_SIGNATURE_HEART_FONT_PX - POSTCARD_SIGNATURE_HEART_GAP_PX) /
              (text.length * POSTCARD_SIGNATURE_CHAR_WIDTH_EM),
          ),
        ),
      )
    : POSTCARD_SIGNATURE_FONT_PX;
  const heartFontPx = Math.round((fontPx * POSTCARD_SIGNATURE_HEART_FONT_PX) / POSTCARD_SIGNATURE_FONT_PX);
  const textMaxWidthPx = POSTCARD_MESSAGE_BOX_WIDTH_PX - indentPx - heartFontPx - POSTCARD_SIGNATURE_HEART_GAP_PX;

  return { text, indentPx, fontPx, heartFontPx, textMaxWidthPx };
}
