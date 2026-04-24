import { message } from "@/components/StyledComponents";
import { useCallback } from "react";
import { copyTextToClipboard } from "@/utils/clipboard";

export const useCopy = () => {
  const copy = useCallback(async (text: string) => {
    try {
      await copyTextToClipboard(text);
      message.success("Copied to clipboard");
      return true;
    } catch {
      message.error("Could not copy");
      return false;
    }
  }, []);

  return { copy };
};
