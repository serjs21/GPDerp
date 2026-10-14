"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { useGoogleOAuthClientId } from "@/app/providers/GoogleOAuthAvailabilityProvider";
import type { GoogleOAuthScopeProps } from "./GoogleOAuthScope.types";

/** Loads the Google Identity script only while an auth surface is mounted (it sets third-party cookies). */
export function GoogleOAuthScope({ children }: GoogleOAuthScopeProps) {
  const clientId = useGoogleOAuthClientId();
  if (!clientId) return <>{children}</>;
  return <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>;
}
