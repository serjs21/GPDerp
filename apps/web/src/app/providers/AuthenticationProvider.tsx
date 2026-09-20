"use client";

import "@/axios.setup";
import { createContext, useContext, type ReactNode } from "react";
import { useAuthentication, type AuthenticationResult } from "@/hooks/useAuthentication";

// #region agent log
const AUTH_CTX_MODULE_ID = `auth-ctx-${Math.random().toString(36).slice(2, 8)}`;
// #endregion

const AuthenticationContext = createContext<AuthenticationResult | undefined>(undefined);

export const AuthenticationProvider = ({ children }: { children: ReactNode }) => {
  const authState = useAuthentication();

  // #region agent log
  fetch('http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ab780c'},body:JSON.stringify({sessionId:'ab780c',runId:'pre-fix',hypothesisId:'C',location:'AuthenticationProvider.tsx:AuthenticationProvider',message:'AuthenticationProvider render',data:{moduleId:AUTH_CTX_MODULE_ID,hasUserId:Boolean(authState?.user?.id)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion

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
  // #region agent log
  fetch('http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ab780c'},body:JSON.stringify({sessionId:'ab780c',runId:'pre-fix',hypothesisId:'A',location:'AuthenticationProvider.tsx:MockAuthenticationProvider',message:'MockAuthenticationProvider render',data:{moduleId:AUTH_CTX_MODULE_ID,isLoggedIn:value?.isLoggedIn},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  return (
    <AuthenticationContext.Provider value={value}>
      {children}
    </AuthenticationContext.Provider>
  );
}

export const useAuthenticationState = (): AuthenticationResult => {
  const authState = useContext(AuthenticationContext);
  if (!authState) {
    // #region agent log
    fetch('http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ab780c'},body:JSON.stringify({sessionId:'ab780c',runId:'pre-fix',hypothesisId:'A',location:'AuthenticationProvider.tsx:useAuthenticationState',message:'auth context missing — about to throw',data:{moduleId:AUTH_CTX_MODULE_ID},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    throw new Error("useAuthenticationState must be used within AuthenticationProvider");
  }
  return authState;
};
