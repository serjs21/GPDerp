"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { AuthGateModal } from "@/components/AuthGateModal/AuthGateModal";
import {
  ResetPasswordModal,
  type ResetPasswordMode,
} from "@/components/ResetPasswordModal";
import axios from "axios";
import {
  AUTH_REQUIRED_EVENT,
  cancelAuthRequestQueue,
  flushAuthRequestQueue,
} from "@/axios.setup";
import { useAuthenticationState } from "./AuthenticationProvider";

type AuthModalMode = "login" | "register";

type OpenResetPasswordOptions = {
  mode: ResetPasswordMode;
  token?: string;
};

type AuthenticationVerificationContextValue = {
  requestAuthentication: (initialMode?: AuthModalMode) => boolean;
  openAuthenticationModal: (initialMode?: AuthModalMode) => void;
  closeAuthenticationModal: () => void;
  openResetPasswordModal: (options: OpenResetPasswordOptions) => void;
  closeResetPasswordModal: () => void;
  authModalCloseToken: number;
};

const AuthenticationVerificationContext = createContext<
  AuthenticationVerificationContextValue | undefined
>(undefined);

export function AuthenticationVerificationProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn, checkAuthentication } = useAuthenticationState();
  const router = useRouter();
  const isLoggedInRef = useRef(isLoggedIn);
  isLoggedInRef.current = isLoggedIn;
  const skipCancelOnCloseRef = useRef(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>("login");
  const [authModalCloseToken, setAuthModalCloseToken] = useState(0);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetMode, setResetMode] = useState<ResetPasswordMode>("request");
  const [resetToken, setResetToken] = useState<string | undefined>(undefined);

  const closeAuthenticationModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthModalCloseToken((previous) => previous + 1);

    if (skipCancelOnCloseRef.current) {
      skipCancelOnCloseRef.current = false;
      return;
    }
    // Dismiss without login: fail held mutations instead of hanging forever.
    if (!isLoggedInRef.current) {
      cancelAuthRequestQueue();
    }
  }, []);

  const openAuthenticationModal = useCallback((initialMode: AuthModalMode = "login") => {
    setAuthModalMode(initialMode);
    setIsAuthModalOpen(true);
  }, []);

  const closeResetPasswordModal = useCallback(() => {
    setIsResetModalOpen(false);
    setResetToken(undefined);
  }, []);

  const openResetPasswordModal = useCallback(
    (options: OpenResetPasswordOptions) => {
      closeAuthenticationModal();
      setResetMode(options.mode);
      setResetToken(options.token);
      setIsResetModalOpen(true);
    },
    [closeAuthenticationModal],
  );

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
      openAuthenticationModal("login");
    };

    window.addEventListener(AUTH_REQUIRED_EVENT, onUnauthorized);
    return () => {
      window.removeEventListener(AUTH_REQUIRED_EVENT, onUnauthorized);
    };
  }, [openAuthenticationModal]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("resetToken") ?? params.get("token");
    if (!token) return;

    openResetPasswordModal({ mode: "confirm", token });

    params.delete("resetToken");
    params.delete("token");
    const query = params.toString();
    const path = window.location.pathname || "/";
    router.replace(query ? `${path}?${query}` : path);
  }, [openResetPasswordModal, router]);

  const contextValue = useMemo(
    () => ({
      requestAuthentication,
      openAuthenticationModal,
      closeAuthenticationModal,
      openResetPasswordModal,
      closeResetPasswordModal,
      authModalCloseToken,
    }),
    [
      authModalCloseToken,
      closeAuthenticationModal,
      closeResetPasswordModal,
      openAuthenticationModal,
      openResetPasswordModal,
      requestAuthentication,
    ],
  );

  return (
    <AuthenticationVerificationContext.Provider value={contextValue}>
      {children}
      <AuthGateModal
        open={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={closeAuthenticationModal}
        onAuthenticated={() => {
          // AuthGateModal also calls onClose; skip cancel so flush can replay.
          skipCancelOnCloseRef.current = true;
          checkAuthentication();
          void flushAuthRequestQueue((config) => axios(config));
        }}
      />
      <ResetPasswordModal
        open={isResetModalOpen}
        mode={resetMode}
        token={resetToken}
        onClose={closeResetPasswordModal}
        onConfirmSuccess={() => {
          openAuthenticationModal("login");
        }}
      />
    </AuthenticationVerificationContext.Provider>
  );
}

export const useAuthenticationVerification = (): AuthenticationVerificationContextValue => {
  const context = useContext(AuthenticationVerificationContext);
  if (context) {
    return context;
  }
  throw new Error("useAuthenticationVerification must be used within AuthenticationVerificationProvider");
};
