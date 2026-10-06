"use client";

import { CelestialThemeProvider } from "@/app/providers/CelestialThemeProvider";
import { usePostcardTheme } from "@/hooks/usePostcardTheme";
import { PostcardPreview } from "./PostcardPreview";
import type { PostcardStoryStageProps } from "./PostcardStoryStage.types";

function PostcardStoryStageInner({
  haiku,
  fontScale,
  scale,
}: Omit<PostcardStoryStageProps, "slot">) {
  const theme = usePostcardTheme();
  return <PostcardPreview theme={theme} haiku={haiku} fontScale={fontScale} scale={scale} />;
}

/** Storybook stage: fixed celestial slot → postcard preview. */
export function PostcardStoryStage({ slot, ...rest }: PostcardStoryStageProps) {
  return (
    <CelestialThemeProvider key={slot} initialSlot={slot}>
      <PostcardStoryStageInner {...rest} />
    </CelestialThemeProvider>
  );
}
