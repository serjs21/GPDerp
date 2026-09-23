"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { comicToast } from "@/components/ComicToast";
import type { HaikuDto } from "@/api/haikus";
import {
  HAIKU_LIST_PAGE_SIZE,
  prependHaikuToInfiniteCache,
} from "@/api/haikus";
import { isInsufficientCreditsError } from "@/api/agents";
import { useHaikuSocket } from "@/hooks/useHaikuSocket";
import { useAuthenticationVerification } from "@/app/providers/AuthenticationVerificationProvider";
import { usePendingHaikuSubmit } from "./usePendingHaikuSubmit";

export type UseHaikuGenerationFlowOptions = {
  onHaikuSaved?: (haiku: HaikuDto) => void;
};

export function useHaikuGenerationFlow(options?: UseHaikuGenerationFlowOptions) {
  const { onHaikuSaved: onHaikuSavedExtra } = options ?? {};
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const { requestAuthentication } = useAuthenticationVerification();

  const { generatingDraft } = useHaikuSocket({
    onHaikuSaved: (haiku) => {
      // Snap before prepend so index-0 never paints at stop-19 under creation focus.
      onHaikuSavedExtra?.(haiku);
      prependHaikuToInfiniteCache(queryClient, HAIKU_LIST_PAGE_SIZE, haiku);
    },
  });

  const onError = useCallback(
    (error?: unknown) => {
      if (isInsufficientCreditsError(error)) return;
      comicToast.error("Don't panic, but something went wrong", {
        description:
          "Our slaves are working hard on fixing this issue. We will dispatch someone to hit them harder soon.\nPlease try again later.",
        duration: 3000,
      });
    },
    [],
  );

  const { savePendingSubject, clearPendingSubject, runAgent } = usePendingHaikuSubmit({
    setSubject,
    setIsLoading,
    onError,
  });

  useEffect(() => {
    if (!isLoading) inputRef.current?.focus();
  }, [isLoading]);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = subject.trim();
      if (!trimmed) return;

      if (!requestAuthentication()) {
        savePendingSubject(trimmed);
        return;
      }

      clearPendingSubject();
      await runAgent(trimmed);
      inputRef.current?.focus();
    },
    [clearPendingSubject, requestAuthentication, runAgent, savePendingSubject, subject],
  );

  return {
    subject,
    setSubject,
    isLoading,
    generatingDraft,
    inputRef,
    onSubmit,
  };
}
