"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { EMAIL_CHANGE_REVERT_PASSWORD_MIN_LENGTH } from "./consts/emailChangeRevertConsts";

/** New-password + confirmation fields with the same client checks as the reset-password modal. */
export function useRevertPasswordForm(onSubmitPassword: (password: string) => void) {
  const t = useTranslations("EmailChangeRevert");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const submit = () => {
    if (password.length < EMAIL_CHANGE_REVERT_PASSWORD_MIN_LENGTH) {
      setLocalError(t("passwordTooShort", { min: EMAIL_CHANGE_REVERT_PASSWORD_MIN_LENGTH }));
      return;
    }
    if (password !== confirmation) {
      setLocalError(t("passwordsDoNotMatch"));
      return;
    }
    setLocalError(null);
    onSubmitPassword(password);
  };

  return {
    password,
    confirmation,
    localError,
    submit,
    onFormSubmit: (event: FormEvent) => {
      event.preventDefault();
      submit();
    },
    changePassword: (value: string) => {
      setPassword(value);
      setLocalError(null);
    },
    changeConfirmation: (value: string) => {
      setConfirmation(value);
      setLocalError(null);
    },
  };
}
