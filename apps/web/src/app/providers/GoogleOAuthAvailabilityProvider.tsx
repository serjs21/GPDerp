"use client";

import { createContext, useContext, type ReactNode } from "react";

const GoogleOAuthAvailabilityContext = createContext(false);

export const GoogleOAuthAvailabilityProvider = ({
  children,
  enabled,
}: {
  children: ReactNode;
  enabled: boolean;
}) => {
  return (
    <GoogleOAuthAvailabilityContext.Provider value={enabled}>
      {children}
    </GoogleOAuthAvailabilityContext.Provider>
  );
};

export const useGoogleOAuthAvailability = () => useContext(GoogleOAuthAvailabilityContext);
