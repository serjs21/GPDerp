import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { copyTextToClipboard } from "@/utils/clipboard";
import { comicToast } from "@/components/ComicToast";

export const useCopy = () => {
  const t = useTranslations("CommonHooks.useCopy");
  const copy = useCallback(async (text: string) => {
    try {
      await copyTextToClipboard(text);
      comicToast.success(t("copied"));
      return true;
    } catch {
      comicToast.error(t("copyError"));
      return false;
    }
  }, [t]);

  return { copy };
};
