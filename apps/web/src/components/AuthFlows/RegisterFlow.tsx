"use client";

import { forwardRef, useImperativeHandle, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import authStyles from "@/app/auth.shared.module.css";
import { AuthField, GoogleSquareButton } from "@/components/AuthFlows/AuthFlowChrome";
import { ComicModalInput } from "@/components/ComicModalInput";
import { ComicPasswordInput } from "@/components/ComicPasswordInput";
import { ComicPageCtaAction } from "@/components/ComicPageLayout";
import { comicToast } from "@/components/ComicToast";
import { withDefaults } from "@/utils/props/withDefaults";
import type { AuthFlowHandle } from "./LoginFlow.types";
import type { RegisterFlowProps } from "./RegisterFlow.types";
import { useRegisterForm } from "./useRegisterForm";

const REGISTER_FLOW_DEFAULTS = { showGoogle: false, hideCta: false };

export const RegisterFlow = forwardRef<AuthFlowHandle, RegisterFlowProps>(function RegisterFlow(props, ref) {
  const { showGoogle, hideCta } = withDefaults(props, REGISTER_FLOW_DEFAULTS);
  const t = useTranslations("AuthFlows.register");
  const form = useRegisterForm({
    onSuccess: props.onSuccess,
    showGoogle,
    onSubmittingChange: props.onSubmittingChange,
    credentials: props.credentials,
  });

  useImperativeHandle(ref, () => ({
    submit: form.validateAndSubmit,
  }));

  const onFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    form.validateAndSubmit();
  };

  return (
    <div className={authStyles.flow}>
      {form.canShowGoogle ? (
        <div className={authStyles.socialBlock}>
          <GoogleSquareButton
            text="signup_with"
            onSuccess={(credential) => void form.signUpWithGoogle(credential)}
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
            value={form.email}
            onChange={(e) => form.onEmailChange(e.target.value)}
            placeholder={t("emailPlaceholder")}
            aria-label={t("emailPlaceholder")}
          />
        </AuthField>
        <AuthField>
          <ComicPasswordInput
            name="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => form.onPasswordChange(e.target.value)}
            placeholder={t("passwordPlaceholder")}
            aria-label={t("passwordPlaceholder")}
          />
        </AuthField>
        <AuthField>
          <ComicPasswordInput
            name="confirm"
            autoComplete="new-password"
            value={form.confirm}
            onChange={(e) => form.onConfirmChange(e.target.value)}
            placeholder={t("confirmPasswordPlaceholder")}
            aria-label={t("confirmPasswordPlaceholder")}
          />
        </AuthField>
        {form.error ? <p className={authStyles.fieldError}>{form.error}</p> : null}
        {hideCta ? null : (
          <div className={authStyles.submitItem}>
            <ComicPageCtaAction
              label={form.submitting ? t("submitting") : t("submit")}
              type="submit"
              busy={form.submitting}
              disabled={form.submitting}
              onClick={form.validateAndSubmit}
            />
          </div>
        )}
      </form>
    </div>
  );
});
