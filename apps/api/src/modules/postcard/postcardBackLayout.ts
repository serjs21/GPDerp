import {
  POSTCARD_ADDRESS_LINE_COUNT,
  POSTCARD_ADDRESSEE,
  POSTCARD_FALLBACK_FONT_FAMILY,
  POSTCARD_HAND_FONT_FAMILY,
  POSTCARD_HEIGHT,
  POSTCARD_MESSAGE_BOX_WIDTH_PX,
  POSTCARD_MESSAGE_FONT_PX,
  POSTCARD_MESSAGE_LINE_HEIGHT_PX,
  POSTCARD_MESSAGE_MAX_LINES,
  POSTCARD_WIDTH,
} from "../../consts/postcard";

/** Minimal React-element shape Satori accepts; avoids a React dependency in the API. */
export type PostcardNode = {
  type: string;
  props: Record<string, unknown> & { children?: PostcardNode | string | Array<PostcardNode | string> };
};

const INK = "#2f4a9a";
const LINE = "#1d1b18";
const PAPER = "#fffdf8";
const NBSP = "\u00A0";

const el = (
  type: string,
  style: Record<string, unknown>,
  children?: PostcardNode["props"]["children"],
  extra: Record<string, unknown> = {},
): PostcardNode => ({ type, props: { style, children, ...extra } });

const messageLines = (lines: string[]): PostcardNode =>
  el(
    "div",
    {
      display: "flex",
      flexDirection: "column",
      width: POSTCARD_MESSAGE_BOX_WIDTH_PX,
      height: POSTCARD_MESSAGE_LINE_HEIGHT_PX * POSTCARD_MESSAGE_MAX_LINES,
      overflow: "hidden",
    },
    lines.map((line) =>
      el(
        "div",
        {
          display: "flex",
          height: POSTCARD_MESSAGE_LINE_HEIGHT_PX,
          fontSize: POSTCARD_MESSAGE_FONT_PX,
          lineHeight: `${POSTCARD_MESSAGE_LINE_HEIGHT_PX}px`,
          whiteSpace: "pre",
        },
        line || NBSP,
      ),
    ),
  );

const signature = (senderName: string): PostcardNode =>
  el(
    "div",
    {
      display: "flex",
      alignItems: "center",
      margin: "0 0 6px 130px",
      fontSize: 46,
      lineHeight: 1.2,
      transform: "rotate(-4deg)",
    },
    [
      el("span", { fontSize: 38, marginRight: 14 }, "♥"),
      el(
        "span",
        { maxWidth: 400, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" },
        `From: ${senderName}`,
      ),
    ],
  );

const addressLine = (text: string): PostcardNode =>
  el(
    "div",
    {
      display: "block",
      padding: "0 4px 8px",
      borderBottom: `6px solid ${LINE}`,
      fontSize: 38,
      lineHeight: 1.25,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    text || NBSP,
  );

/**
 * Server mirror of apps/web PostcardMessage (full-bleed 1200x800 back side).
 * `lines` are already wrapped by `wrapPostcardMessage`.
 */
export function buildPostcardBackTree(params: {
  lines: string[];
  senderName: string;
  stampSrc: string;
}): PostcardNode {
  const addressLines = Array.from({ length: POSTCARD_ADDRESS_LINE_COUNT }, (_, index) =>
    index === 0 ? POSTCARD_ADDRESSEE : "",
  );

  return el(
    "div",
    {
      display: "flex",
      boxSizing: "border-box",
      width: POSTCARD_WIDTH,
      height: POSTCARD_HEIGHT,
      padding: "56px 60px 48px 64px",
      border: `6px solid ${LINE}`,
      background: PAPER,
      color: INK,
      fontFamily: `"${POSTCARD_HAND_FONT_FAMILY}", "${POSTCARD_FALLBACK_FONT_FAMILY}"`,
      fontWeight: 400,
    },
    [
      el(
        "div",
        {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: POSTCARD_MESSAGE_BOX_WIDTH_PX,
          flexShrink: 0,
        },
        [messageLines(params.lines), signature(params.senderName)],
      ),
      el("div", { flexShrink: 0, width: 6, margin: "24px 44px 8px", borderRadius: 3, background: LINE }),
      el(
        "div",
        {
          position: "relative",
          display: "flex",
          flexGrow: 1,
          flexDirection: "column",
          justifyContent: "flex-end",
          minWidth: 0,
        },
        [
          el(
            "img",
            { position: "absolute", top: 0, right: 0, width: 210, height: 210, transform: "rotate(3deg)" },
            undefined,
            { src: params.stampSrc, width: 210, height: 210 },
          ),
          el(
            "div",
            { display: "flex", flexDirection: "column", gap: 24, paddingBottom: 16 },
            [el("div", { display: "flex", fontSize: 36, lineHeight: 1, opacity: 0.8 }, "To:"), ...addressLines.map(addressLine)],
          ),
        ],
      ),
    ],
  );
}
