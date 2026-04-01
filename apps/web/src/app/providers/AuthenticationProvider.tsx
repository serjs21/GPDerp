"use client";

import "@/axios.setup";
import { useState } from "react";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useAuthentication, type AuthenticationResult } from "@/hooks/useAuthentication";

const AuthenticationContext = createContext<AuthenticationResult | undefined>(undefined);

export const AuthenticationProvider = ({ children }: { children: ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  const authState = useAuthentication();
  console.log('AuthenticationProvider', authState);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <AuthenticationContext.Provider value={authState} key={authState.user?.id || 'unauthenticated'}>
      {children}
    </AuthenticationContext.Provider>
  );
};

export const useAuthenticationState = (): AuthenticationResult => {
  const authState = useContext(AuthenticationContext);
  if (!authState) {
    throw new Error("useAuthenticationState must be used within AuthenticationProvider");
  }
  return authState;
};

