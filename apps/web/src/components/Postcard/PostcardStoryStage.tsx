"use client";

import { CelestialThemeProvider } from "@/app/providers/CelestialThemeProvider";
import { usePostcardTheme } from "@/hooks/usePostcardTheme";
import { generatePostcardImage } from "./generatePostcardImage";
import { postcardFilename } from "./postcardDevDownload";
import { PostcardPreview } from "./PostcardPreview";
import { PostcardRenderer } from "./PostcardRenderer";
import type { PostcardStoryStageProps } from "./PostcardStoryStage.types";

function PostcardStoryStageInner({
  haiku,
  fontScale,
  scale,
}: Omit<PostcardStoryStageProps, "slot">) {
  const theme = usePostcardTheme();
  return (
    <PostcardPreview
      generate={() => generatePostcardImage({ theme, haiku, fontScale })}
      filename={postcardFilename(haiku.id)}
      scale={scale}
    >
      <PostcardRenderer theme={theme} haiku={haiku} fontScale={fontScale} />
    </PostcardPreview>
  );
}

/** Storybook stage: fixed celestial slot → postcard front preview. */
export function PostcardStoryStage({ slot, ...rest }: PostcardStoryStageProps) {
  return (
    <CelestialThemeProvider key={slot} initialSlot={slot}>
      <PostcardStoryStageInner {...rest} />
    </CelestialThemeProvider>
  );
}
