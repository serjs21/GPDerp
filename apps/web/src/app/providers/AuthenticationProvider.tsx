"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAuthentication, type AuthenticationState } from "@/hooks/useAuthentication";

const AuthenticationContext = createContext<AuthenticationState | undefined>(undefined);

export const AuthenticationProvider = ({ children }: { children: ReactNode }) => {
  const authState = useAuthentication();

  return (
    <AuthenticationContext.Provider value={authState}>
      {children}
    </AuthenticationContext.Provider>
  );
};

export const useAuthenticationState = (): AuthenticationState => {
  const ctx = useContext(AuthenticationContext);
  if (!ctx) {
    throw new Error("useAuthenticationState must be used within AuthenticationProvider");
  }
  return ctx;
};

