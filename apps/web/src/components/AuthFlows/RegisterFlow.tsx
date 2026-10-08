"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  type FormEvent,
} from "react";
import { useTranslations } from "next-intl";
import authStyles from "@/app/auth.shared.module.css";
import { useGoogleOAuthAvailability } from "@/app/providers/GoogleOAuthAvailabilityProvider";
import { AuthField, GoogleSquareButton } from "@/components/AuthFlows/AuthFlowChrome";
import { ComicModalInput } from "@/components/ComicModalInput";
import { ComicPageCtaAction } from "@/components/ComicPageLayout";
import { comicToast } from "@/components/ComicToast";
import { useRegistration, type RegisterFormValues } from "@/hooks/useRegistration";
import type { AuthFlowHandle } from "./LoginFlow";

type RegisterFlowProps = {
  onSuccess: () => void;
  showGoogle?: boolean;
  /** Hide in-flow CTA (parent provides ComicPageDialog ctaFooter). */
  hideCta?: boolean;
  onSubmittingChange?: (submitting: boolean) => void;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export const RegisterFlow = forwardRef<AuthFlowHandle, RegisterFlowProps>(function RegisterFlow(
  { onSuccess, showGoogle = false, hideCta = false, onSubmittingChange },
  ref,
) {
  const t = useTranslations("AuthFlows.register");
  const googleOAuthEnabled = useGoogleOAuthAvailability();
  const canShowGoogle = showGoogle && googleOAuthEnabled;
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
    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      setError(t("invalidEmail"));
      return;
    }
    if (!password) {
      setError(t("passwordRequired"));
      return;
    }
    if (password.length < 8) {
      setError(t("passwordTooShort"));
      return;
    }
    if (confirm !== password) {
      setError(t("passwordsDoNotMatch"));
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

  useImperativeHandle(ref, () => ({
    submit: validateAndSubmit,
  }));

  const onFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    validateAndSubmit();
  };

  return (
    <div className={authStyles.flow}>
      {canShowGoogle ? (
        <div className={authStyles.socialBlock}>
          <GoogleSquareButton
            text="signup_with"
            onSuccess={(credential) => void signUpWithGoogle(credential)}
            onError={() => comicToast.error(t("googleSignUpFailed"))}
          />
          <div className={authStyles.divider}>{t("divider")}</div>
        </div>
      ) : null}

      <form className={authStyles.flowForm} onSubmit={onFormSubmit} noValidate>
        <AuthField>
          <ComicModalInput
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            placeholder={t("emailPlaceholder")}
            aria-label={t("emailPlaceholder")}
          />
        </AuthField>
        <AuthField>
          <ComicModalInput
            type="password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            placeholder={t("passwordPlaceholder")}
            aria-label={t("passwordPlaceholder")}
          />
        </AuthField>
        <AuthField>
          <ComicModalInput
            type="password"
            name="confirm"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              setError(null);
            }}
            placeholder={t("confirmPasswordPlaceholder")}
            aria-label={t("confirmPasswordPlaceholder")}
          />
        </AuthField>
        {error ? <p className={authStyles.fieldError}>{error}</p> : null}
        {!hideCta ? (
          <div className={authStyles.submitItem}>
            <ComicPageCtaAction
              label={submitting ? t("submitting") : t("submit")}
              type="submit"
              busy={submitting}
              disabled={submitting}
              onClick={validateAndSubmit}
            />
          </div>
        ) : null}
      </form>
    </div>
  );
});
