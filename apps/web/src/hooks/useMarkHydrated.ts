"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { FIRST_REVEAL_MAX_WAIT_MS } from "@/consts/visualReadiness/criticalAssets";
import { getFirstRevealCriticalAssets } from "@/utils/visualReadiness/firstRevealAssets";
import { useMemberViewReady } from "./useMemberViewReady";
import { useVisualReadiness } from "./useVisualReadiness";

/** Marks html[data-hydrated] once the first view's art is ready; returns whether that point has been reached. */
export const useMarkHydrated = (): boolean => {
  const { initialized, isLoggedIn } = useAuthenticationState();
  const pathname = usePathname();
  // The loader covers only the document's first view; client navigations don't change what it waits for.
  const [initialPathname] = useState(pathname);
  const readiness = useVisualReadiness({
    criticalAssets: getFirstRevealCriticalAssets(initialPathname, isLoggedIn),
    enabled: initialized,
    maxWaitMs: FIRST_REVEAL_MAX_WAIT_MS,
  });
  // Member Main is code-split; revealing before it mounts would show an empty path.
  const memberViewReady = useMemberViewReady(
    initialized && isLoggedIn && initialPathname === "/",
    FIRST_REVEAL_MAX_WAIT_MS,
  );

  const revealed =
    initialized && memberViewReady && (readiness.status === "ready" || readiness.status === "degraded");

  useEffect(() => {
    const root = document.documentElement;
    if (!revealed || root.dataset.hydrated === "true") return;
    root.dataset.visualReady = readiness.status;
    // HtmlLoaderExit turns the HtmlLoader page away from here (see html[data-loader-exited]).
    root.dataset.hydrated = "true";
  }, [revealed, readiness.status]);

  return revealed;
};
