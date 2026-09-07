"use client";

import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import { AuthField } from "@/components/AuthFlows/AuthFlowChrome";
import { ComicModalInput } from "@/components/ComicModalInput";
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

export function ResetPasswordModal({
  open,
  onClose,
  mode,
  token,
  onRequestDone,
  onConfirmSuccess,
}: ResetPasswordModalProps) {
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
      setError("Enter a valid email");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await axios.post("/auth/reset/request", { email: trimmed });
      comicToast.success("If an account exists for that email, we sent reset instructions.");
      setEmail("");
      onRequestDone?.();
      onClose();
    } catch {
      comicToast.error("Request failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitConfirm = async () => {
    if (!token) {
      comicToast.error("Reset link is missing or invalid.");
      return;
    }
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await axios.post("/auth/reset/confirm", { token, password });
      comicToast.success("Password updated. You can sign in now.");
      onConfirmSuccess?.();
      onClose();
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.data) {
        const data = e.response.data as { error?: string };
        comicToast.error(data.error ?? "Reset failed");
        return;
      }
      comicToast.error("Reset failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (mode === "request") {
      void submitRequest();
      return;
    }
    void submitConfirm();
  };

  const title = mode === "request" ? "Reset password" : "New password";
  const ctaLabel = mode === "request" ? "Send reset link" : "Update password";

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
          label={ctaLabel}
          busy={submitting}
          disabled={submitting}
          onClick={() => {
            if (mode === "request") {
              void submitRequest();
              return;
            }
            void submitConfirm();
          }}
        />
      }
    >
      <div className={styles.body}>
        <h2 className={styles.title}>{title}</h2>
        {mode === "request" ? (
          <p className={styles.lead}>
            Enter your email and we will send a link if an account exists.
          </p>
        ) : (
          <p className={styles.lead}>Choose a new password for your account.</p>
        )}

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
                placeholder="Email"
                aria-label="Email"
              />
            </AuthField>
          ) : (
            <>
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
                  placeholder="New password"
                  aria-label="New password"
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
                  placeholder="Confirm password"
                  aria-label="Confirm password"
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
