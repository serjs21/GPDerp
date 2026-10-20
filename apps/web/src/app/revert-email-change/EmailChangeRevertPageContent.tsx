"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthenticationVerification } from "@/app/providers/AuthenticationVerificationProvider";
import { EmailChangeRevertView, useEmailChangeRevert } from "@/components/EmailChangeRevert";

/** Query param of the link in the old-address alert (apps/api authTemplates.ts). */
const REVERT_TOKEN_PARAM = "revertToken";

/** Reads the revert token once, drops it from the address bar, and runs the revert flow. */
export function EmailChangeRevertPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Kept in state: stripping it from the URL below must not clear it. Not `token`, which the auth
  // provider treats as a password-reset token.
  const [token] = useState(() => searchParams.get(REVERT_TOKEN_PARAM)?.trim() || null);
  const { openAuthenticationModal } = useAuthenticationVerification();
  const { state, confirm, submitPassword } = useEmailChangeRevert(token);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has(REVERT_TOKEN_PARAM)) return;
    url.searchParams.delete(REVERT_TOKEN_PARAM);
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  return (
    <EmailChangeRevertView
      state={state}
      onConfirm={() => void confirm()}
      onKeep={() => router.push("/")}
      onSubmitPassword={(password) => void submitPassword(password)}
      onSignIn={() => openAuthenticationModal("login")}
    />
  );
}
