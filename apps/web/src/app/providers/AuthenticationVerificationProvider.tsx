"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthGateModal } from "@/components/AuthGateModal/AuthGateModal";
import { AUTH_REQUIRED_EVENT } from "@/axios.setup";
import { useAuthenticationState } from "./AuthenticationProvider";

type AuthModalMode = "login" | "register";

type AuthenticationVerificationContextValue = {
  requestAuthentication: (initialMode?: AuthModalMode) => boolean;
  openAuthenticationModal: (initialMode?: AuthModalMode) => void;
  closeAuthenticationModal: () => void;
  authModalCloseToken: number;
};

const AuthenticationVerificationContext = createContext<AuthenticationVerificationContextValue | undefined>(
  undefined,
);

export function AuthenticationVerificationProvider({ children }: { children: ReactNode }) {
  const { initialized, isLoggedIn, checkAuthentication } = useAuthenticationState();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>("login");
  const [authModalCloseToken, setAuthModalCloseToken] = useState(0);

  const closeAuthenticationModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthModalCloseToken((previous) => previous + 1);
  }, []);

  const openAuthenticationModal = useCallback((initialMode: AuthModalMode = "login") => {
    setAuthModalMode(initialMode);
    setIsAuthModalOpen(true);
  }, []);

  const requestAuthentication = useCallback(
    (initialMode: AuthModalMode = "login") => {
      if (isLoggedIn) return true;
      openAuthenticationModal(initialMode);
      return false;
    },
    [isLoggedIn, openAuthenticationModal],
  );

  useEffect(() => {
    const onUnauthorized = () => {
      if (initialized && !isLoggedIn) {
        openAuthenticationModal("login");
      }
    };

    window.addEventListener(AUTH_REQUIRED_EVENT, onUnauthorized);
    return () => {
      window.removeEventListener(AUTH_REQUIRED_EVENT, onUnauthorized);
    };
  }, [initialized, isLoggedIn, openAuthenticationModal]);

  const contextValue = useMemo(
    () => ({ requestAuthentication, openAuthenticationModal, closeAuthenticationModal, authModalCloseToken }),
    [authModalCloseToken, closeAuthenticationModal, openAuthenticationModal, requestAuthentication],
  );

  return (
    <AuthenticationVerificationContext.Provider value={contextValue}>
      {children}
      <AuthGateModal
        open={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={closeAuthenticationModal}
        onAuthenticated={() => {
          closeAuthenticationModal();
          checkAuthentication();
        }}
      />
    </AuthenticationVerificationContext.Provider>
  );
}

export const useAuthenticationVerification = (): AuthenticationVerificationContextValue => {
  const context = useContext(AuthenticationVerificationContext);
  if (!context) {
    throw new Error("useAuthenticationVerification must be used within AuthenticationVerificationProvider");
  }
  return context;
};
