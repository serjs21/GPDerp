"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ComicPageCtaAction,
  ComicPageDialog,
  ComicPagePanel,
  ComicPageRow,
} from "@/components/ComicPageLayout";
import { LabelMethodIcon } from "@/components/LabelMethodIcon";
import { LoginFlow, type AuthFlowHandle } from "@/components/AuthFlows/LoginFlow";
import { RegisterFlow } from "@/components/AuthFlows/RegisterFlow";
import styles from "./styles.module.css";

const SELECTED_PANEL_WEIGHT = 1.25;
const UNSELECTED_PANEL_WEIGHT = 0.75;

export type AuthGateMode = "login" | "register";

type AuthGateModalProps = {
  open: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
  initialMode?: AuthGateMode;
};

export function AuthGateModal({
  open,
  onClose,
  onAuthenticated,
  initialMode = "login",
}: AuthGateModalProps) {
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
            busy={submitting}
            disabled={submitting}
            onClick={() => loginRef.current?.submit()}
          />
        ) : (
          <ComicPageCtaAction
            label="Create account"
            busy={submitting}
            disabled={submitting}
            onClick={() => registerRef.current?.submit()}
          />
        )
      }
    >
      <div className={styles.body}>
        <ComicPageRow className={styles.methodRow}>
          <ComicPagePanel
            selectable
            selected={mode === "login"}
            onSelect={() => setMode("login")}
            background="sunburst"
            color="blue"
            title="Sign in"
            isMotionBackground={false}
            shine={false}
            sunburstHalftone={false}
            overflowVisible
            flexWeight={mode === "login" ? SELECTED_PANEL_WEIGHT : UNSELECTED_PANEL_WEIGHT}
            ariaLabel="Sign in"
            className={styles.methodPanel}
          >
            <LabelMethodIcon
              src="/login_modal/log-in.svg"
              bubbleStyle="rectangle"
              sourceDirection="none"
              active={mode === "login"}
            />
          </ComicPagePanel>
          <ComicPagePanel
            selectable
            selected={mode === "register"}
            onSelect={() => setMode("register")}
            background="halftone"
            color="purple"
            title="Register"
            overflowVisible
            flexWeight={mode === "register" ? SELECTED_PANEL_WEIGHT : UNSELECTED_PANEL_WEIGHT}
            ariaLabel="Register"
            className={styles.methodPanel}
          >
            <LabelMethodIcon
              src="/login_modal/sign-up.svg"
              bubbleStyle="pointedArcs"
              sourceDirection="none"
              active={mode === "register"}
            />
          </ComicPagePanel>
        </ComicPageRow>

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
              <Link href="/reset_password">Forgot password?</Link>
            </p>
          </div>
        </div>
      </div>
    </ComicPageDialog>
  );
}
