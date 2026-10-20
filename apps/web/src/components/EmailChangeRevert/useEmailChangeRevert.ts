"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useTranslations } from "next-intl";
import {
  confirmEmailChangeRevert,
  fetchEmailChangeRevert,
  setPasswordAfterEmailChangeRevert,
  type EmailChangeRevertResult,
} from "@/api/emailChangeRevert";
import { useOptionalAuthenticationState } from "@/app/providers/AuthenticationProvider";
import type { EmailChangeRevertViewState } from "./EmailChangeRevertView.types";
import { previewToViewState, revertResultToViewState } from "./utils/emailChangeRevertStateUtils";

const serverErrorMessage = (error: unknown): string | null => {
  if (!axios.isAxiosError(error)) return null;
  const message = (error.response?.data as { error?: unknown } | undefined)?.error;
  return typeof message === "string" && message ? message : null;
};

const resetTokenOf = (result: EmailChangeRevertResult) =>
  "passwordResetToken" in result ? (result.passwordResetToken ?? null) : null;

/** Drives the revert page: preview on open, revert on confirm, then the forced new-password step. */
export function useEmailChangeRevert(token: string | null) {
  const t = useTranslations("EmailChangeRevert");
  const auth = useOptionalAuthenticationState();
  const [state, setState] = useState<EmailChangeRevertViewState>(() =>
    token ? { kind: "loading" } : { kind: "invalid" },
  );
  const resetTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetchEmailChangeRevert(token)
      .then((preview) => {
        if (!cancelled) setState(previewToViewState(preview));
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "failed" });
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const confirm = async () => {
    if (!token || state.kind !== "confirm" || state.busy) return;
    setState({ ...state, busy: true });
    try {
      const result = await confirmEmailChangeRevert(token);
      resetTokenRef.current = resetTokenOf(result);
      setState(revertResultToViewState(result));
      // Every session was revoked server-side; clear this tab's auth state too.
      if (auth?.isLoggedIn) void auth.logout();
    } catch {
      setState({ kind: "failed" });
    }
  };

  const submitPassword = async (password: string) => {
    const resetToken = resetTokenRef.current;
    if (!resetToken || state.kind !== "setPassword" || state.busy) return;
    setState({ ...state, busy: true, error: null });
    try {
      await setPasswordAfterEmailChangeRevert(resetToken, password);
      resetTokenRef.current = null;
      setState({ kind: "passwordSaved", restoredEmail: state.restoredEmail });
    } catch (error) {
      setState({ ...state, busy: false, error: serverErrorMessage(error) ?? t("passwordFailed") });
    }
  };

  return { state, confirm, submitPassword };
}
