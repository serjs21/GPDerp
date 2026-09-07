"use client";

import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { useAuthenticationVerification } from "@/app/providers/AuthenticationVerificationProvider";
import { AuthLanternEntry } from "@/components/AuthLanterns";
import styles from "./centeredAuthPrompt.module.css";

export const CenteredAuthPrompt = () => {
  const { initialized, isLoggedIn } = useAuthenticationState();
  const { openAuthenticationModal } = useAuthenticationVerification();

  if (!initialized || isLoggedIn) return null;

  return (
    <div className={styles.wrap}>
      <AuthLanternEntry
        onLoginClick={() => openAuthenticationModal("login")}
        onRegisterClick={() => openAuthenticationModal("register")}
      />
    </div>
  );
};
