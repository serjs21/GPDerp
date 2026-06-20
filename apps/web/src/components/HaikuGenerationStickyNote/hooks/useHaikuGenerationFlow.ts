"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { notification } from "@/components/StyledComponents";
import {
  HAIKU_LIST_PAGE_SIZE,
  prependHaikuToInfiniteCache,
} from "@/api/haikus";
import { useHaikuSocket } from "@/hooks/useHaikuSocket";
import { useAuthenticationVerification } from "@/app/providers/AuthenticationVerificationProvider";
import { usePendingHaikuSubmit } from "./usePendingHaikuSubmit";

export function useHaikuGenerationFlow() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const { requestAuthentication } = useAuthenticationVerification();
  const [api, contextHolder] = notification.useNotification({ maxCount: 1 });

  const { generatingDraft } = useHaikuSocket({
    onHaikuSaved: (haiku) => {
      prependHaikuToInfiniteCache(queryClient, HAIKU_LIST_PAGE_SIZE, haiku);
    },
  });

  const onError = useCallback(() => {
    api.error({
      message: "Don't panic, but something went wrong",
      description:
        "Our slaves are working hard on fixing this issue. We will dispatch someone to hit them harder soon.\nPlease try again later.",
      placement: "top",
      duration: 3,
    });
  }, [api]);

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
    contextHolder,
  };
}
