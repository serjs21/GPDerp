"use client";

import "@/axios.setup";
import { createContext, useContext, type ReactNode } from "react";
import { useAuthentication, type AuthenticationResult } from "@/hooks/useAuthentication";

const AuthenticationContext = createContext<AuthenticationResult | undefined>(undefined);

export const AuthenticationProvider = ({ children }: { children: ReactNode }) => {
  const authState = useAuthentication();

  return (
    <AuthenticationContext.Provider value={authState}>
      {children}
    </AuthenticationContext.Provider>
  );
};

/** Storybook/tests: inject a fixed auth result without hitting `/auth/me`. */
export function MockAuthenticationProvider({
  value,
  children,
}: {
  value: AuthenticationResult;
  children: ReactNode;
}) {
  return (
    <AuthenticationContext.Provider value={value}>
      {children}
    </AuthenticationContext.Provider>
  );
}

export const useAuthenticationState = (): AuthenticationResult => {
  const authState = useContext(AuthenticationContext);
  if (!authState) {
    throw new Error("useAuthenticationState must be used within AuthenticationProvider");
  }
  return authState;
};
