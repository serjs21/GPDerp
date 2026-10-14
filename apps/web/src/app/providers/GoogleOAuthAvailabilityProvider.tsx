"use client";

import { createContext, useContext, type ReactNode } from "react";

const GoogleOAuthClientIdContext = createContext<string | null>(null);

/** Carries the Google client id; the GSI script itself loads only inside `GoogleOAuthScope`. */
export const GoogleOAuthAvailabilityProvider = ({
  children,
  clientId,
}: {
  children: ReactNode;
  clientId?: string | null;
}) => {
  return (
    <GoogleOAuthClientIdContext.Provider value={clientId || null}>
      {children}
    </GoogleOAuthClientIdContext.Provider>
  );
};

export const useGoogleOAuthClientId = () => useContext(GoogleOAuthClientIdContext);

export const useGoogleOAuthAvailability = () => useGoogleOAuthClientId() !== null;
