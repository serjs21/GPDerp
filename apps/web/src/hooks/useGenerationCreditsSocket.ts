"use client";

import { useCallback } from "react";
import { notifyGenerationCreditsUpdated } from "@/api/payments";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { useWebSocket } from "./useWebSocket";
import { parseGenerationCreditsMessage } from "./parseGenerationCreditsMessage";

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000/ws";

export function useGenerationCreditsSocket() {
  const { isLoggedIn } = useAuthenticationState();

  const onMessage = useCallback((event: MessageEvent) => {
    const parsed = parseGenerationCreditsMessage(String(event.data ?? ""));
    if (!parsed) return;
    notifyGenerationCreditsUpdated(parsed.credits);
  }, []);

  useWebSocket({
    url: SOCKET_URL,
    enabled: isLoggedIn,
    reconnect: true,
    onMessage,
  });
}

export function GenerationCreditsSocket() {
  useGenerationCreditsSocket();
  return null;
}
