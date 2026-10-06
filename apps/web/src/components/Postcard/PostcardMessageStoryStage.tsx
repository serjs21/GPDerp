"use client";

import { CelestialThemeProvider } from "@/app/providers/CelestialThemeProvider";
import { usePostcardTheme } from "@/hooks/usePostcardTheme";
import { generatePostcardMessageImage } from "./generatePostcardMessageImage";
import { PostcardMessage } from "./PostcardMessage";
import type { PostcardMessageStoryStageProps } from "./PostcardMessageStoryStage.types";
import { postcardFilename } from "./postcardDevDownload";
import { PostcardPreview } from "./PostcardPreview";

function PostcardMessageStoryStageInner({
  message,
  senderName,
  recipients,
  scale,
}: Omit<PostcardMessageStoryStageProps, "slot">) {
  const theme = usePostcardTheme();
  return (
    <PostcardPreview
      generate={() => generatePostcardMessageImage({ theme, message, senderName, recipients })}
      filename={postcardFilename("story", "back")}
      scale={scale}
      label="Live message side"
    >
      <PostcardMessage
        theme={theme}
        message={message}
        senderName={senderName}
        recipients={recipients}
      />
    </PostcardPreview>
  );
}

/** Storybook stage: fixed celestial slot → postcard back (message side) preview. */
export function PostcardMessageStoryStage({ slot, ...rest }: PostcardMessageStoryStageProps) {
  return (
    <CelestialThemeProvider key={slot} initialSlot={slot}>
      <PostcardMessageStoryStageInner {...rest} />
    </CelestialThemeProvider>
  );
}
