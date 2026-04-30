"use client";

import { useAuthenticationVerification } from "@/app/providers/AuthenticationVerificationProvider";
import { AuthDualityToggle } from "./components/AuthDualityToggle/AuthDualityToggle";
import styles from "./style.module.css";

export const LoggedOutAuthLinks = () => {
  const { openAuthenticationModal, authModalCloseToken } = useAuthenticationVerification();

  return (
    <nav className={styles.headerAuthNav} aria-label="Account">
      <AuthDualityToggle
        borderRadius={0}
        width={240}
        onClose={authModalCloseToken}
        onLoginClick={() => openAuthenticationModal("login")}
        onRegisterClick={() => openAuthenticationModal("register")}
      />
    </nav>
  );
};
