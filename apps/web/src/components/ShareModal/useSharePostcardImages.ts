import { useState } from "react";
import type { HaikuDto } from "@/api/haikus";
import { comicToast } from "@/components/ComicToast";
import { useOptionalAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { generatePostcardImages, type PostcardImages } from "@/components/Postcard/generatePostcardImages";
import { resolvePostcardSenderName } from "@/components/Postcard/utils/postcardMessageFit";
import { useOptionalPostcardTheme } from "@/hooks/usePostcardTheme";

/**
 * Generates both postcard sides for the share email.
 * Resolves undefined when no haiku/theme is available, null when generation failed (already toasted).
 */
export function useSharePostcardImages(haiku: HaikuDto | null) {
  const [preparingPostcard, setPreparingPostcard] = useState(false);
  const postcardTheme = useOptionalPostcardTheme();
  const auth = useOptionalAuthenticationState();

  const preparePostcard = async (
    message: string,
    recipients: string[],
  ): Promise<PostcardImages | undefined | null> => {
    if (!haiku || !postcardTheme) return undefined;
    setPreparingPostcard(true);
    try {
      return await generatePostcardImages({
        theme: postcardTheme,
        haiku,
        message,
        senderName: resolvePostcardSenderName(auth?.user ?? {}),
        recipients,
      });
    } catch (e) {
      console.error("[postcard] generation failed", e);
      comicToast.error("Could not prepare the postcard images");
      return null;
    } finally {
      setPreparingPostcard(false);
    }
  };

  return { preparingPostcard, preparePostcard };
}
