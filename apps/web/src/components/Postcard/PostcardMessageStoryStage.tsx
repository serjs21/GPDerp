"use client";

import { generatePostcardMessageImage } from "./generatePostcardMessageImage";
import { PostcardMessage } from "./PostcardMessage";
import type { PostcardMessageStoryStageProps } from "./PostcardMessageStoryStage.types";
import { postcardFilename } from "./postcardDevDownload";
import { PostcardPreview } from "./PostcardPreview";

/** Storybook stage: postcard back (message side) live render + generated PNG. */
export function PostcardMessageStoryStage({
  message,
  senderName,
  recipient,
  scale,
}: PostcardMessageStoryStageProps) {
  return (
    <PostcardPreview
      generate={() => generatePostcardMessageImage({ message, senderName, recipient })}
      filename={postcardFilename("story", "back")}
      scale={scale}
      label="Live message side"
    >
      <PostcardMessage message={message} senderName={senderName} recipient={recipient} />
    </PostcardPreview>
  );
}
