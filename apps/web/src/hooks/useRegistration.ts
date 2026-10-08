import { comicToast } from "@/components/ComicToast";
import axios from "axios";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  fetchUsernameAvailability,
  loginWithGoogleCredential,
  registerWithEmailAndPassword,
} from "@/api/authentication";

export const MIN_USERNAME_LENGTH = 3;

export type RegisterFormValues = {
  email: string;
  password: string;
  confirm: string;
};

type UseRegistrationOptions = {
  onSuccess: () => void;
  afterAccountCreated?: () => void;
};

export function useRegistration({ onSuccess, afterAccountCreated }: UseRegistrationOptions) {
  const t = useTranslations("AuthHooks");
  const [submitting, setSubmitting] = useState(false);

  const registerWithPassword = async (values: RegisterFormValues) => {
    setSubmitting(true);
    try {
      await registerWithEmailAndPassword({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
      comicToast.success(t("registrationSent"));
      afterAccountCreated?.();
      onSuccess();
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.data) {
        const data = e.response.data as { error?: string; code?: string };
        comicToast.error(data.error ?? t("registrationFailed"));
        return;
      }
      comicToast.error(t("registrationFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const validateUsernameIsFree = async (raw: string) => {
    const v = raw?.trim();
    if (!v || v.length < MIN_USERNAME_LENGTH) return;
    const result = await fetchUsernameAvailability(v);
    if (!result.available) {
      throw new Error(result.reason ?? t("usernameUnavailable"));
    }
  };

  const signUpWithGoogle = async (credential: string | undefined) => {
    if (!credential) return;
    try {
      await loginWithGoogleCredential(credential);
      onSuccess();
    } catch {
      comicToast.error(t("googleSignInFailed"));
    }
  };

  return {
    submitting,
    registerWithPassword,
    validateUsernameIsFree,
    signUpWithGoogle,
  };
}
