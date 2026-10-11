"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { useTranslations } from "next-intl";
import { requestEmailChange, resendEmailChange, type UserProfileResponse } from "@/api/user";
import { comicToast } from "@/components/ComicToast";
import { isValidEmail } from "@/utils/strings";
import { withPendingEmailChange } from "../utils/profileUtils";

/** Change-email and resend-verification dialogs: drafts, open state, and the requests. */
export function useProfileEmailChange(
  setProfile: Dispatch<SetStateAction<UserProfileResponse | null>>,
  pendingNewEmail: string | null,
) {
  const t = useTranslations("Profile");
  const [emailDraft, setEmailDraft] = useState("");
  const [emailConfirmOpen, setEmailConfirmOpen] = useState(false);
  const [resendOpen, setResendOpen] = useState(false);
  const [resendEmailDraft, setResendEmailDraft] = useState("");
  const [requestingEmailChange, setRequestingEmailChange] = useState(false);
  const [resendingEmailChange, setResendingEmailChange] = useState(false);
  const validEmailDraft = useMemo(() => isValidEmail(emailDraft), [emailDraft]);

  const createEmailChange = async () => {
    try {
      setRequestingEmailChange(true);
      const result = await requestEmailChange(emailDraft.trim());
      setProfile((prev) => withPendingEmailChange(prev, result.pendingEmail));
      setEmailConfirmOpen(false);
      comicToast.success(t("toasts.emailChangeSent"));
    } catch {
      comicToast.error(t("toasts.emailChangeError"));
    } finally {
      setRequestingEmailChange(false);
    }
  };

  const resendChange = async () => {
    try {
      setResendingEmailChange(true);
      const result = await resendEmailChange(resendEmailDraft.trim() || undefined);
      setProfile((prev) => withPendingEmailChange(prev, result.pendingEmail));
      setResendOpen(false);
      comicToast.success(t("toasts.verificationSent"));
    } catch {
      comicToast.error(t("toasts.verificationError"));
    } finally {
      setResendingEmailChange(false);
    }
  };

  return {
    emailDraft,
    resendEmailDraft,
    validEmailDraft,
    requestingEmailChange,
    resendingEmailChange,
    emailConfirmOpen,
    resendOpen,
    onEmailDraftChange: setEmailDraft,
    onResendEmailDraftChange: setResendEmailDraft,
    onOpenEmailConfirm: () => setEmailConfirmOpen(true),
    onCloseEmailConfirm: () => setEmailConfirmOpen(false),
    onConfirmEmailChange: () => void createEmailChange(),
    onOpenResend: () => {
      setResendEmailDraft(pendingNewEmail ?? "");
      setResendOpen(true);
    },
    onCloseResend: () => setResendOpen(false),
    onConfirmResend: () => void resendChange(),
  };
}
