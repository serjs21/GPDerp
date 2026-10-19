import { GMAIL_BODY_CSS } from "../consts/gmailPreviewConsts";

/** Iframe document: Gmail's body defaults plus the (already sanitized) email body. */
export function buildGmailFrameDoc(bodyHtml: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><base target="_blank"><style>${GMAIL_BODY_CSS}</style></head><body>${bodyHtml}</body></html>`;
}

export type PlainTextPart = { kind: "text" | "link"; value: string };

const URL_PATTERN = /(https?:\/\/[^\s<>"]+)/g;

/** Plain-text body split into text and auto-linked URLs, as Gmail shows text/plain mail. */
export function linkifyPlainText(text: string): PlainTextPart[] {
  return text
    .split(URL_PATTERN)
    .filter((value) => value.length > 0)
    .map((value) => ({ kind: /^https?:\/\//.test(value) ? "link" : "text", value }));
}
