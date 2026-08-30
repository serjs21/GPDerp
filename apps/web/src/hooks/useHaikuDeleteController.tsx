"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  deleteHaiku,
  HAIKU_LIST_PAGE_SIZE,
  prependHaikuToInfiniteCache,
  removeHaikuFromInfiniteCache,
  type HaikuDto,
} from "@/api/haikus";
import { DeleteFailedModal } from "@/components/DeleteFailedModal";
import { message } from "@/components/StyledComponents";

export function useHaikuDeleteController(): {
  onHaikuDeleted: (haiku: HaikuDto) => void;
  onHaikuDeleteFailed: (haiku: HaikuDto) => void;
  deleteFailedModal: ReactNode;
} {
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
      message.success("Haiku deleted");
      setFailedHaiku(null);
    } catch {
      message.error("Could not delete haiku.");
    } finally {
      setRetrying(false);
    }
  }, [failedHaiku]);

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
