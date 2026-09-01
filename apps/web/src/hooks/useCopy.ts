import { useCallback } from "react";
import { copyTextToClipboard } from "@/utils/clipboard";
import { comicToast } from "@/components/ComicToast";

export const useCopy = () => {
  const copy = useCallback(async (text: string) => {
    try {
      await copyTextToClipboard(text);
      comicToast.success("Copied to clipboard");
      return true;
    } catch {
      comicToast.error("Could not copy");
      return false;
    }
  }, []);

  return { copy };
};
