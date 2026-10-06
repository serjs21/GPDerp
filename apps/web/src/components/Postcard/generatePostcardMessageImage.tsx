"use client";

import { PostcardMessage } from "./PostcardMessage";
import type { PostcardMessageProps } from "./PostcardMessage.types";
import { POSTCARD_MESSAGE_MAX_LINES } from "./consts/postcardMessageConsts";
import { clampPostcardMessage } from "./utils/postcardMessageFit";
import { measurePostcardMessageLines } from "./utils/postcardMessageMeasure";
import { renderOffscreenPng } from "./utils/renderOffscreenPng";

export type GeneratePostcardMessageImageInput = Pick<
  PostcardMessageProps,
  "message" | "senderName" | "recipient"
>;

/** Render the postcard back (message side) for one recipient, at the same size as the front. */
export function generatePostcardMessageImage({
  message,
  senderName,
  recipient,
}: GeneratePostcardMessageImageInput): Promise<Blob> {
  const clamped = clampPostcardMessage(message);
  if (measurePostcardMessageLines(clamped) > POSTCARD_MESSAGE_MAX_LINES) {
    return Promise.reject(new Error("The message does not fit on the postcard"));
  }
  return renderOffscreenPng(
    <PostcardMessage message={clamped} senderName={senderName} recipient={recipient} />,
  );
}
