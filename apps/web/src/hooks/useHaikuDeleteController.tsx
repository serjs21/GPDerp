"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  deleteHaiku,
  HAIKU_LIST_PAGE_SIZE,
  prependHaikuToInfiniteCache,
  removeHaikuFromInfiniteCache,
  type HaikuDto,
} from "@/api/haikus";
import { DeleteFailedModal } from "@/components/DeleteFailedModal";
import { comicToast } from "@/components/ComicToast";

export function useHaikuDeleteController(): {
  onHaikuDeleted: (haiku: HaikuDto) => void;
  onHaikuDeleteFailed: (haiku: HaikuDto) => void;
  deleteFailedModal: ReactNode;
} {
  const t = useTranslations("HaikuHooks.deleteController");
  const queryClient = useQueryClient();
  const [failedHaiku, setFailedHaiku] = useState<HaikuDto | null>(null);
  const [retrying, setRetrying] = useState(false);

  const onHaikuDeleted = useCallback(
    (haiku: HaikuDto) => {
      removeHaikuFromInfiniteCache(queryClient, HAIKU_LIST_PAGE_SIZE, haiku.id);
    },
    [queryClient],
  );

  const onHaikuDeleteFailed = useCallback((haiku: HaikuDto) => {
    setFailedHaiku(haiku);
  }, []);

  const onRetry = useCallback(async () => {
    if (!failedHaiku) return;
    setRetrying(true);
    try {
      await deleteHaiku(failedHaiku.id);
      comicToast.success(t("deleted"));
      setFailedHaiku(null);
    } catch {
      comicToast.error(t("deleteFailed"));
    } finally {
      setRetrying(false);
    }
  }, [failedHaiku, t]);

  const onLeaveItBe = useCallback(() => {
    if (failedHaiku) {
      prependHaikuToInfiniteCache(queryClient, HAIKU_LIST_PAGE_SIZE, failedHaiku);
    }
    setFailedHaiku(null);
  }, [failedHaiku, queryClient]);

  const deleteFailedModal = useMemo(
    () => (
      <DeleteFailedModal
        open={failedHaiku != null}
        retrying={retrying}
        onRetry={() => void onRetry()}
        onLeaveItBe={onLeaveItBe}
      />
    ),
    [failedHaiku, onLeaveItBe, onRetry, retrying],
  );

  return {
    onHaikuDeleted,
    onHaikuDeleteFailed,
    deleteFailedModal,
  };
}
