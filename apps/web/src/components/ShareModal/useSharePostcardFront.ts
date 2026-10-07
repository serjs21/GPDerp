import { useState } from "react";
import type { HaikuDto } from "@/api/haikus";
import { comicToast } from "@/components/ComicToast";
import { generatePostcardImage } from "@/components/Postcard/generatePostcardImage";
import { useOptionalPostcardTheme } from "@/hooks/usePostcardTheme";

/**
 * Renders the postcard front once for the share email (the back is rendered by the API).
 * Resolves undefined when no haiku/theme is available, null when rendering failed (already toasted).
 */
export function useSharePostcardFront(haiku: HaikuDto | null) {
  const [preparingPostcard, setPreparingPostcard] = useState(false);
  const postcardTheme = useOptionalPostcardTheme();

  const preparePostcardFront = async (): Promise<Blob | undefined | null> => {
    if (!haiku || !postcardTheme) return undefined;
    setPreparingPostcard(true);
    try {
      return await generatePostcardImage({ theme: postcardTheme, haiku });
    } catch (e) {
      console.error("[postcard] front generation failed", e);
      comicToast.error("Could not prepare the postcard image");
      return null;
    } finally {
      setPreparingPostcard(false);
    }
  };

  return { preparingPostcard, preparePostcardFront };
}
