"use client";

import { useCallback, useEffect, useRef } from "react";
import { isInsufficientCreditsError, runHaikuAgent } from "@/api/agents";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { PENDING_HAIKU_SUBJECT_STORAGE_KEY } from "@/config/userConfiguration";

type UsePendingHaikuSubmitOptions = {
  setSubject: (value: string) => void;
  setIsLoading: (value: boolean) => void;
  onError: (error?: unknown) => void;
  clearPendingOnSuccess?: () => void;
};

export function usePendingHaikuSubmit({
  setSubject,
  setIsLoading,
  onError,
}: UsePendingHaikuSubmitOptions) {
  const { isLoggedIn, initialized } = useAuthenticationState();
  const resumeInFlightRef = useRef(false);

  const savePendingSubject = useCallback((subject: string) => {
    window.localStorage.setItem(PENDING_HAIKU_SUBJECT_STORAGE_KEY, subject.trim());
  }, []);

  const clearPendingSubject = useCallback(() => {
    window.localStorage.removeItem(PENDING_HAIKU_SUBJECT_STORAGE_KEY);
  }, []);

  const readPendingSubject = useCallback((): string | null => {
    const pending = window.localStorage.getItem(PENDING_HAIKU_SUBJECT_STORAGE_KEY);
    return pending?.trim() ? pending.trim() : null;
  }, []);

  const runAgent = useCallback(
    async (subject: string) => {
      try {
        setIsLoading(true);
        await runHaikuAgent(subject);
        setSubject("");
        clearPendingSubject();
      } catch (error) {
        console.error("Failed to send haiku agent request:", error);
        onError(error);
        if (isInsufficientCreditsError(error)) {
          // Keep subject so the user can retry after buying credits.
          return;
        }
      } finally {
        setIsLoading(false);
      }
    },
    [clearPendingSubject, onError, setIsLoading, setSubject],
  );

  useEffect(() => {
    if (!initialized || !isLoggedIn || resumeInFlightRef.current) return;

    const pending = readPendingSubject();
    if (!pending) return;

    resumeInFlightRef.current = true;
    clearPendingSubject();
    void runAgent(pending).finally(() => {
      resumeInFlightRef.current = false;
    });
  }, [clearPendingSubject, initialized, isLoggedIn, readPendingSubject, runAgent]);

  return {
    savePendingSubject,
    clearPendingSubject,
    runAgent,
  };
}
