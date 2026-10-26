"use client";

import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { useTranslations } from "next-intl";
import { AuthField } from "@/components/AuthFlows/AuthFlowChrome";
import { ComicModalInput } from "@/components/ComicModalInput";
import { ComicPasswordInput } from "@/components/ComicPasswordInput";
import { ComicPageCtaAction, ComicPageDialog } from "@/components/ComicPageLayout";
import { comicToast } from "@/components/ComicToast";
import styles from "./ResetPasswordModal.module.css";

export type ResetPasswordMode = "request" | "confirm";

export type ResetPasswordModalProps = {
  open: boolean;
  onClose: () => void;
  mode: ResetPasswordMode;
  /** Required when `mode` is `"confirm"`. */
  token?: string;
  onRequestDone?: () => void;
  onConfirmSuccess?: () => void;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const RESET_COPY_KEYS = {
  request: { title: "requestTitle", lead: "requestLead", cta: "requestCta" },
  confirm: { title: "confirmTitle", lead: "confirmLead", cta: "confirmCta" },
} as const;

export function ResetPasswordModal({
  open,
  onClose,
  mode,
  token,
  onRequestDone,
  onConfirmSuccess,
}: ResetPasswordModalProps) {
  const t = useTranslations("ResetPasswordModal");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setEmail("");
    setPassword("");
    setConfirm("");
    setError(null);
    setSubmitting(false);
  }, [open, mode, token]);

  const submitRequest = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!isValidEmail(trimmed)) {
      setError(t("invalidEmail"));
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await axios.post("/auth/reset/request", { email: trimmed });
      comicToast.success(t("requestSent"));
      setEmail("");
      onRequestDone?.();
      onClose();
    } catch {
      comicToast.error(t("requestFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const submitConfirm = async () => {
    if (!token) {
      comicToast.error(t("linkInvalid"));
      return;
    }
    if (!password || password.length < 8) {
      setError(t("passwordTooShort"));
      return;
    }
    if (password !== confirm) {
      setError(t("passwordsDoNotMatch"));
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await axios.post("/auth/reset/confirm", { token, password });
      comicToast.success(t("confirmSuccess"));
      onConfirmSuccess?.();
      onClose();
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.data) {
        const data = e.response.data as { error?: string };
        comicToast.error(data.error ?? t("confirmFailed"));
        return;
      }
      comicToast.error(t("confirmFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const submit = () => {
    void (mode === "request" ? submitRequest() : submitConfirm());
  };

  const onFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit();
  };

  const copyKeys = RESET_COPY_KEYS[mode];

  return (
    <ComicPageDialog
      open={open}
      showClose
      contentClassName={styles.dialogContent}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      ctaFooter={
        <ComicPageCtaAction
          label={t(copyKeys.cta)}
          type="submit"
          busy={submitting}
          disabled={submitting}
          onClick={submit}
        />
      }
    >
      <div className={styles.body}>
        <h2 className={styles.title}>{t(copyKeys.title)}</h2>
        <p className={styles.lead}>{t(copyKeys.lead)}</p>

        <form className={styles.form} onSubmit={onFormSubmit} noValidate>
          {mode === "request" ? (
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
          ) : (
            <>
              <AuthField>
                <ComicPasswordInput
                  name="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder={t("newPasswordPlaceholder")}
                  aria-label={t("newPasswordPlaceholder")}
                />
              </AuthField>
              <AuthField>
                <ComicPasswordInput
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
            </>
          )}
          {error ? <p className={styles.error}>{error}</p> : null}
        </form>
      </div>
    </ComicPageDialog>
  );
}
