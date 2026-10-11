"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useGoogleOAuthAvailability } from "@/app/providers/GoogleOAuthAvailabilityProvider";
import { useRegistration, type RegisterFormValues } from "@/hooks/useRegistration";
import type { RegisterFlowProps } from "./RegisterFlow.types";
import { registerFormErrorKey } from "./utils/authFlowValidation";

/** Email/password/confirm fields, validation, and password + Google sign-up via useRegistration. */
export function useRegisterForm({
  onSuccess,
  showGoogle,
  onSubmittingChange,
}: Omit<RegisterFlowProps, "hideCta" | "showGoogle"> & { showGoogle: boolean }) {
  const t = useTranslations("AuthFlows.register");
  const googleOAuthEnabled = useGoogleOAuthAvailability();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { submitting, registerWithPassword, signUpWithGoogle } = useRegistration({
    onSuccess,
    afterAccountCreated: () => {
      setEmail("");
      setPassword("");
      setConfirm("");
    },
  });

  useEffect(() => {
    onSubmittingChange?.(submitting);
  }, [onSubmittingChange, submitting]);

  const validateAndSubmit = () => {
    const trimmedEmail = email.trim();
    const errorKey = registerFormErrorKey(trimmedEmail, password, confirm);
    if (errorKey) {
      setError(t(errorKey));
      return;
    }
    setError(null);
    const values: RegisterFormValues = {
      email: trimmedEmail,
      password,
      confirm,
    };
    void registerWithPassword(values);
  };

  const clearingError = (setValue: (value: string) => void) => (value: string) => {
    setValue(value);
    setError(null);
  };

  return {
    canShowGoogle: showGoogle && googleOAuthEnabled,
    email,
    password,
    confirm,
    error,
    submitting,
    onEmailChange: clearingError(setEmail),
    onPasswordChange: clearingError(setPassword),
    onConfirmChange: clearingError(setConfirm),
    validateAndSubmit,
    signUpWithGoogle,
  };
}
