"use client";

import { useAuthenticationVerification } from "@/app/providers/AuthenticationVerificationProvider";
import { AuthLanternEntry } from "@/components/AuthLanterns";
import styles from "./style.module.css";

export const LoggedOutAuthLinks = () => {
  const { openAuthenticationModal } = useAuthenticationVerification();

  return (
    <nav className={styles.headerAuthNav} aria-label="Account">
      <AuthLanternEntry
        compact
        onLoginClick={() => openAuthenticationModal("login")}
        onRegisterClick={() => openAuthenticationModal("register")}
      />
    </nav>
  );
};
