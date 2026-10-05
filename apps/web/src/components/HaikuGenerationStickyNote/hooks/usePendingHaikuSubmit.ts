"use client";

import { useCallback, useEffect, useRef } from "react";
import { insufficientCreditsMessage, isInsufficientCreditsError, runHaikuAgent } from "@/api/agents";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { PENDING_HAIKU_SUBJECT_STORAGE_KEY, RESUME_PENDING_HAIKU_EVENT } from "@/config/userConfiguration";
import { openNoCreditsLeft } from "@/components/NoCreditsLeft/pendingHaikuAfterPurchase";

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
          openNoCreditsLeft(subject, insufficientCreditsMessage(error));
          return;
        }
      } finally {
        setIsLoading(false);
      }
    },
    [clearPendingSubject, onError, setIsLoading, setSubject],
  );

  const resumePending = useCallback(() => {
    if (resumeInFlightRef.current) return;
    const pending = readPendingSubject();
    if (!pending) return;
    resumeInFlightRef.current = true;
    clearPendingSubject();
    void runAgent(pending).finally(() => {
      resumeInFlightRef.current = false;
    });
  }, [clearPendingSubject, readPendingSubject, runAgent]);

  useEffect(() => {
    if (!initialized || !isLoggedIn) return;
    resumePending();
  }, [initialized, isLoggedIn, resumePending]);

  useEffect(() => {
    const onResume = () => resumePending();
    window.addEventListener(RESUME_PENDING_HAIKU_EVENT, onResume);
    return () => window.removeEventListener(RESUME_PENDING_HAIKU_EVENT, onResume);
  }, [resumePending]);

  return {
    savePendingSubject,
    clearPendingSubject,
    runAgent,
  };
}
