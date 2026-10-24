"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { continueWithGoogleCredential } from "@/api/authentication";
import { useGoogleOAuthAvailability } from "@/app/providers/GoogleOAuthAvailabilityProvider";
import type { LoginFlowProps } from "./LoginFlow.types";
import { loginFormErrorKey } from "./utils/authFlowValidation";
import {
  logAuthDebug,
  logAxiosAuthError,
  notifyGoogleLoginError,
  notifyPasswordLoginError,
} from "./utils/loginErrorUtils";

type LoginValues = {
  email: string;
  password: string;
};

/** Email/password fields, validation, and password + Google sign-in requests. */
export function useLoginForm({
  onSuccess,
  showGoogle,
  onGoogleSignupRequired,
  onSubmittingChange,
}: Omit<LoginFlowProps, "hideCta" | "showGoogle"> & { showGoogle: boolean }) {
  const t = useTranslations("AuthFlows.login");
  const googleOAuthEnabled = useGoogleOAuthAvailability();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onSubmittingChange?.(submitting);
  }, [onSubmittingChange, submitting]);

  const onFinish = async (values: LoginValues) => {
    setSubmitting(true);
    try {
      await axios.post("/auth/login", values);
      setEmail("");
      setPassword("");
      onSuccess();
    } catch (e: unknown) {
      logAxiosAuthError("password_login_request_error", "/auth/login", e);
      notifyPasswordLoginError(e, t);
    } finally {
      setSubmitting(false);
    }
  };

  const validateAndSubmit = () => {
    const trimmedEmail = email.trim();
    const errorKey = loginFormErrorKey(trimmedEmail, password);
    if (errorKey) {
      setError(t(errorKey));
      return;
    }
    setError(null);
    void onFinish({ email: trimmedEmail, password });
  };

  const onGoogleCredential = async (credential: string | undefined) => {
    if (!credential) {
      logAuthDebug("google_login_callback_missing_credential", {});
      return;
    }
    try {
      await continueWithGoogleCredential(credential);
      onSuccess();
    } catch (e: unknown) {
      logAxiosAuthError("google_login_request_error", "/auth/google", e);
      notifyGoogleLoginError(e, t, onGoogleSignupRequired);
    }
  };

  const clearingError = (setValue: (value: string) => void) => (value: string) => {
    setValue(value);
    setError(null);
  };

  return {
    canShowGoogle: showGoogle && googleOAuthEnabled,
    email,
    password,
    error,
    submitting,
    onEmailChange: clearingError(setEmail),
    onPasswordChange: clearingError(setPassword),
    validateAndSubmit,
    onGoogleCredential,
  };
}
