"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchCredits, notifyGenerationCreditsUpdated } from "@/api/payments";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { getSharedSocket } from "@/utils/webSocket/sharedSocketManager";
import { SHARE_LINKS_QUERY_KEY } from "./shareLinksCache";

/**
 * Keeps the tab's shared socket on the current identity (it connects once auth is known and is
 * re-established on login/logout) and re-reads socket-driven data from REST after a reconnect,
 * since notifications sent while disconnected are lost.
 */
export function useWebSocketSession() {
  const { initialized, isLoggedIn, user } = useAuthenticationState();
  const queryClient = useQueryClient();
  const loggedInRef = useRef(isLoggedIn);
  useEffect(() => {
    loggedInRef.current = isLoggedIn;
  }, [isLoggedIn]);

  const identity = !initialized ? null : isLoggedIn && user.id ? `user:${user.id}` : "anon";

  useEffect(() => {
    if (identity) getSharedSocket().setIdentity(identity);
  }, [identity]);

  useEffect(
    () =>
      getSharedSocket().onReconnected(() => {
        void queryClient.invalidateQueries({ queryKey: SHARE_LINKS_QUERY_KEY });
        if (!loggedInRef.current) return;
        void fetchCredits()
          .then((data) => notifyGenerationCreditsUpdated(data.credits))
          .catch(() => undefined);
      }),
    [queryClient],
  );
}
