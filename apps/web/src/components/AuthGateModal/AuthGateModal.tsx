"use client";

import { useEffect, useRef, useState } from "react";
import {
  ComicPageCtaAction,
  ComicPageDialog,
} from "@/components/ComicPageLayout";
import { ComicPanelTabs } from "@/components/ComicPanelTabs";
import { LabelMethodIcon } from "@/components/LabelMethodIcon";
import { LoginFlow, type AuthFlowHandle } from "@/components/AuthFlows/LoginFlow";
import { RegisterFlow } from "@/components/AuthFlows/RegisterFlow";
import { useAuthenticationVerification } from "@/app/providers/AuthenticationVerificationProvider";
import styles from "./styles.module.css";

export type AuthGateMode = "login" | "register";

type AuthGateModalProps = {
  open: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
  initialMode?: AuthGateMode;
  /** Story/test override; defaults to auth verification context. */
  onForgotPassword?: () => void;
};

export function AuthGateModal({
  open,
  onClose,
  onAuthenticated,
  initialMode = "login",
  onForgotPassword,
}: AuthGateModalProps) {
  const authVerification = useAuthenticationVerification();
  const openForgot =
    onForgotPassword ?? (() => authVerification.openResetPasswordModal({ mode: "request" }));
  const [mode, setMode] = useState<AuthGateMode>(initialMode);
  const [submitting, setSubmitting] = useState(false);
  const loginRef = useRef<AuthFlowHandle>(null);
  const registerRef = useRef<AuthFlowHandle>(null);

  useEffect(() => {
    if (!open) return;
    setMode(initialMode);
    setSubmitting(false);
  }, [open, initialMode]);

  const handleAuthenticated = () => {
    onAuthenticated();
    onClose();
  };

  return (
    <ComicPageDialog
      open={open}
      showClose
      contentClassName={styles.dialogContent}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      ctaFooter={
        mode === "login" ? (
          <ComicPageCtaAction
            label="Sign in"
            type="submit"
            busy={submitting}
            disabled={submitting}
            onClick={() => loginRef.current?.submit()}
          />
        ) : (
          <ComicPageCtaAction
            label="Create account"
            type="submit"
            busy={submitting}
            disabled={submitting}
            onClick={() => registerRef.current?.submit()}
          />
        )
      }
    >
      <div className={styles.body}>
        <ComicPanelTabs
          className={styles.methodRow}
          panelClassName={styles.methodPanel}
          value={mode}
          onChange={setMode}
          tabs={[
            {
              id: "login",
              panel: {
                background: "sunburst",
                color: "blue",
                title: "Sign in",
                ariaLabel: "Sign in",
              },
              content: (
                <LabelMethodIcon
                  src="/auth/login_modal/log-in.svg"
                  bubbleStyle="rectangle"
                  sourceDirection="none"
                  active={mode === "login"}
                />
              ),
            },
            {
              id: "register",
              panel: {
                background: "halftone",
                color: "purple",
                title: "Register",
                ariaLabel: "Register",
              },
              content: (
                <LabelMethodIcon
                  src="/auth/login_modal/sign-up.svg"
                  bubbleStyle="pointedArcs"
                  sourceDirection="none"
                  active={mode === "register"}
                  className={styles.registerMethodIcon}
                />
              ),
            },
          ]}
        />

        <div className={styles.contentSlot}>
          <div className={styles.tabPane}>
            {mode === "login" ? (
              <LoginFlow
                ref={loginRef}
                showGoogle
                hideCta
                onSubmittingChange={setSubmitting}
                onSuccess={handleAuthenticated}
                onGoogleSignupRequired={() => setMode("register")}
              />
            ) : (
              <RegisterFlow
                ref={registerRef}
                showGoogle
                hideCta
                onSubmittingChange={setSubmitting}
                onSuccess={handleAuthenticated}
              />
            )}
            <p className={styles.linkRow}>
              <button
                type="button"
                className={styles.linkButton}
                onClick={openForgot}
              >
                Forgot password?
              </button>
            </p>
          </div>
        </div>
      </div>
    </ComicPageDialog>
  );
}
