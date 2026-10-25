"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { isVerificationResendCooldownError, resendVerificationForCurrentUser } from "@/api/authentication";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { refreshAuthSession } from "@/authRefresh";
import { comicToast } from "@/components/ComicToast";

/** "Send me verification email": sends to the signed-in address and reports the outcome as a toast. */
export function useResendVerificationEmail() {
  const t = useTranslations("EmailVerificationView");
  const { checkAuthentication } = useAuthenticationState();
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (sending) return;
    setSending(true);
    try {
      const status = await resendVerificationForCurrentUser();
      if (status === "already_verified") {
        // Verified elsewhere: refresh the token (it carries emailVerifiedAt) to lift the gate.
        await refreshAuthSession({ force: true }).catch(() => undefined);
        checkAuthentication();
        return;
      }
      comicToast.success(t("sent"));
    } catch (error) {
      comicToast.error(t(isVerificationResendCooldownError(error) ? "cooldown" : "error"));
    } finally {
      setSending(false);
    }
  };

  return { sending, send };
}
