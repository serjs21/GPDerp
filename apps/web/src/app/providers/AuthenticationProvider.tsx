"use client";

import "@/axios.setup";
import { useState } from "react";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useAuthentication, type AuthenticationResult } from "@/hooks/useAuthentication";

const AuthenticationContext = createContext<AuthenticationResult | undefined>(undefined);

export const AuthenticationProvider = ({ children }: { children: ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  const authState = useAuthentication();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <AuthenticationContext.Provider value={authState}>
      {children}
    </AuthenticationContext.Provider>
  );
};

export const useAuthenticationState = (): AuthenticationResult => {
  const ctx = useContext(AuthenticationContext);
  if (!ctx) {
    throw new Error("useAuthenticationState must be used within AuthenticationProvider");
  }
  return ctx;
};

