"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { FIRST_REVEAL_MAX_WAIT_MS } from "@/consts/visualReadiness/criticalAssets";
import { getFirstRevealCriticalAssets } from "@/utils/visualReadiness/firstRevealAssets";
import { useVisualReadiness } from "./useVisualReadiness";

export const useMarkHydrated = () => {
  const { initialized, isLoggedIn } = useAuthenticationState();
  const pathname = usePathname();
  // The loader covers only the document's first view; client navigations don't change what it waits for.
  const [initialPathname] = useState(pathname);
  const readiness = useVisualReadiness({
    criticalAssets: getFirstRevealCriticalAssets(initialPathname, isLoggedIn),
    enabled: initialized,
    maxWaitMs: FIRST_REVEAL_MAX_WAIT_MS,
  });

  useEffect(() => {
    const root = document.documentElement;
    if (!initialized || root.dataset.hydrated === "true") return;
    if (readiness.status !== "ready" && readiness.status !== "degraded") return;
    root.dataset.visualReady = readiness.status;
    // Hides the HtmlLoader (html[data-hydrated="true"] in its CSS).
    root.dataset.hydrated = "true";
  }, [initialized, readiness.status]);
};
