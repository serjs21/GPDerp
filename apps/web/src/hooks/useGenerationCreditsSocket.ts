"use client";

import { useCallback } from "react";
import { notifyGenerationCreditsUpdated } from "@/api/payments";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { useWebSocket } from "./useWebSocket";
import { parseGenerationCreditsMessage } from "./parseGenerationCreditsMessage";
export function useGenerationCreditsSocket() {
  const { isLoggedIn } = useAuthenticationState();

  const onMessage = useCallback((event: MessageEvent) => {
    const parsed = parseGenerationCreditsMessage(String(event.data ?? ""));
    if (!parsed) return;
    notifyGenerationCreditsUpdated(parsed.credits);
  }, []);

  useWebSocket({
    enabled: isLoggedIn,
    onMessage,
  });
}

export function GenerationCreditsSocket() {
  useGenerationCreditsSocket();
  return null;
}
