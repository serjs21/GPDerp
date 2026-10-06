import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import {
  POSTCARD_FALLBACK_FONT_FAMILY,
  POSTCARD_HAND_FONT_FAMILY,
  POSTCARD_HEIGHT,
  POSTCARD_MESSAGE_MAX_LINES,
  POSTCARD_PNG_WIDTH,
  POSTCARD_WIDTH,
} from "../../consts/postcard";
import {
  POSTCARD_FALLBACK_FONT_FILE,
  POSTCARD_HAND_FONT_FILE,
  POSTCARD_STAMP_FILE,
  readPostcardAsset,
} from "./postcardAssets";
import { buildPostcardBackTree } from "./postcardBackLayout";
import { wrapPostcardMessage } from "./postcardTextWrap";

export class PostcardMessageTooLongError extends Error {
  constructor(lineCount: number) {
    super(`Postcard message needs ${lineCount} lines (max ${POSTCARD_MESSAGE_MAX_LINES})`);
    this.name = "PostcardMessageTooLongError";
  }
}

type SatoriOptions = Parameters<typeof satori>[1];

/** Module-level so Satori reuses its parsed-font cache across renders. */
let satoriFonts: SatoriOptions["fonts"] | null = null;
let stampSrc: string | null = null;

const getSatoriFonts = (): SatoriOptions["fonts"] => {
  satoriFonts ??= [
    { name: POSTCARD_HAND_FONT_FAMILY, data: readPostcardAsset(POSTCARD_HAND_FONT_FILE), weight: 400, style: "normal" },
    {
      name: POSTCARD_FALLBACK_FONT_FAMILY,
      data: readPostcardAsset(POSTCARD_FALLBACK_FONT_FILE),
      weight: 400,
      style: "normal",
    },
  ];
  return satoriFonts;
};

const getStampSrc = (): string => {
  stampSrc ??= `data:image/svg+xml;base64,${readPostcardAsset(POSTCARD_STAMP_FILE).toString("base64")}`;
  return stampSrc;
};

/** Render one recipient's postcard back as a POSTCARD_PNG_WIDTH x POSTCARD_PNG_HEIGHT PNG. */
export async function renderPostcardBackPng(params: {
  message: string;
  senderName: string;
  recipient: string;
}): Promise<Buffer> {
  const lines = wrapPostcardMessage(params.message.trim());
  if (lines.length > POSTCARD_MESSAGE_MAX_LINES) throw new PostcardMessageTooLongError(lines.length);

  const tree = buildPostcardBackTree({
    lines,
    senderName: params.senderName.trim() || "Someone",
    recipient: params.recipient,
    stampSrc: getStampSrc(),
  });
  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], {
    width: POSTCARD_WIDTH,
    height: POSTCARD_HEIGHT,
    fonts: getSatoriFonts(),
  });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: POSTCARD_PNG_WIDTH } }).render().asPng();
  return Buffer.from(png);
}
