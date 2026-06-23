"use client";

import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { useAuthenticationVerification } from "@/app/providers/AuthenticationVerificationProvider";
import { AuthDualityToggle } from "./components/AuthDualityToggle/AuthDualityToggle";
import styles from "./centeredAuthPrompt.module.css";

export const CenteredAuthPrompt = () => {
  const { initialized, isLoggedIn } = useAuthenticationState();
  const { openAuthenticationModal, authModalCloseToken } = useAuthenticationVerification();

  if (!initialized || isLoggedIn) return null;

  return (
    <div className={styles.wrap}>
      <AuthDualityToggle
        width={320}
        onClose={authModalCloseToken}
        onLoginClick={() => openAuthenticationModal("login")}
        onRegisterClick={() => openAuthenticationModal("register")}
      />
    </div>
  );
};
