"use client";

import { useEffect, useRef } from "react";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { refreshAuthSession } from "@/authRefresh";

/**
 * Re-reads the session whenever the tab comes back into view, so verifying the email from the
 * link (often another tab) lifts the gate here without a reload. The access token carries
 * `emailVerifiedAt`, hence the forced refresh before re-checking.
 */
export function useEmailVerificationRecheck(enabled: boolean) {
  const { checkAuthentication } = useAuthenticationState();
  const checkRef = useRef(checkAuthentication);

  useEffect(() => {
    checkRef.current = checkAuthentication;
  });

  useEffect(() => {
    if (!enabled) return;
    let inFlight = false;
    const recheck = () => {
      if (document.visibilityState !== "visible" || inFlight) return;
      inFlight = true;
      void refreshAuthSession({ force: true })
        .catch(() => undefined)
        .finally(() => {
          inFlight = false;
          checkRef.current();
        });
    };
    window.addEventListener("focus", recheck);
    document.addEventListener("visibilitychange", recheck);
    return () => {
      window.removeEventListener("focus", recheck);
      document.removeEventListener("visibilitychange", recheck);
    };
  }, [enabled]);
}
