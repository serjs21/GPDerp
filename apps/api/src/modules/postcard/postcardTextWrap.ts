import opentype from "opentype.js";
import {
  POSTCARD_MESSAGE_BOX_WIDTH_PX,
  POSTCARD_MESSAGE_FONT_PX,
  POSTCARD_MESSAGE_MAX_LINES,
} from "../../consts/postcard";
import {
  POSTCARD_FALLBACK_FONT_FILE,
  POSTCARD_HAND_FONT_FILE,
  readPostcardAsset,
} from "./postcardAssets";

type MeasureFonts = { hand: opentype.Font; fallback: opentype.Font };

let fonts: MeasureFonts | null = null;

const parseFont = (fileName: string): opentype.Font => {
  const buffer = readPostcardAsset(fileName);
  return opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
};

const loadFonts = (): MeasureFonts => {
  fonts ??= { hand: parseFont(POSTCARD_HAND_FONT_FILE), fallback: parseFont(POSTCARD_FALLBACK_FONT_FILE) };
  return fonts;
};

/** Width in px, measured per run of characters that resolve to the same font (hand, then fallback). */
export function measurePostcardText(text: string, fontPx: number = POSTCARD_MESSAGE_FONT_PX): number {
  const { hand, fallback } = loadFonts();
  let width = 0;
  let run = "";
  let runFont: opentype.Font | null = null;
  for (const char of text) {
    const font = hand.hasChar(char) ? hand : fallback;
    if (runFont && font !== runFont) {
      width += runFont.getAdvanceWidth(run, fontPx);
      run = "";
    }
    runFont = font;
    run += char;
  }
  if (runFont && run) width += runFont.getAdvanceWidth(run, fontPx);
  return width;
}

const splitAnywhere = (word: string, maxWidth: number, startLine: string): { lines: string[]; rest: string } => {
  const lines: string[] = [];
  let current = startLine;
  for (const char of word) {
    if (current && measurePostcardText(current + char) > maxWidth) {
      lines.push(current);
      current = char;
    } else {
      current += char;
    }
  }
  return { lines, rest: current };
};

const wrapParagraph = (paragraph: string, maxWidth: number): string[] => {
  const lines: string[] = [];
  let line = "";
  for (const token of paragraph.split(/(\s+)/).filter(Boolean)) {
    if (/^\s+$/.test(token)) {
      line += token;
      continue;
    }
    if (measurePostcardText((line + token).trimEnd()) <= maxWidth) {
      line += token;
      continue;
    }
    if (line.trim()) {
      lines.push(line.trimEnd());
      line = "";
    }
    if (measurePostcardText(token) <= maxWidth) {
      line = token;
      continue;
    }
    const split = splitAnywhere(token, maxWidth, line);
    lines.push(...split.lines);
    line = split.rest;
  }
  lines.push(line.trimEnd());
  return lines;
};

/**
 * Wrap the message the way the card's message box does (`white-space: pre-wrap`,
 * `overflow-wrap: anywhere`): keep hard line breaks, break at spaces, split a word
 * only when it cannot fit on a line of its own.
 */
export function wrapPostcardMessage(
  message: string,
  maxWidth: number = POSTCARD_MESSAGE_BOX_WIDTH_PX,
): string[] {
  const normalized = message.replace(/\r\n?/g, "\n");
  if (!normalized) return [];
  return normalized.split("\n").flatMap((paragraph) => wrapParagraph(paragraph, maxWidth));
}

export const postcardMessageFits = (message: string): boolean =>
  wrapPostcardMessage(message.trim()).length <= POSTCARD_MESSAGE_MAX_LINES;
