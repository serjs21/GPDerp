import { message } from "@/components/StyledComponents";
import axios from "axios";
import { useState } from "react";
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
  const [submitting, setSubmitting] = useState(false);

  const registerWithPassword = async (values: RegisterFormValues) => {
    setSubmitting(true);
    try {
      await registerWithEmailAndPassword({
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
      message.success("If this email can be used for a new account, we sent a verification link. Check your inbox.");
      afterAccountCreated?.();
      onSuccess();
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.data) {
        const data = e.response.data as { error?: string; code?: string };
        message.error(data.error ?? "Registration failed");
        return;
      }
      message.error("Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const validateUsernameIsFree = async (raw: string) => {
    const v = raw?.trim();
    if (!v || v.length < MIN_USERNAME_LENGTH) return;
    const result = await fetchUsernameAvailability(v);
    if (!result.available) {
      throw new Error(result.reason ?? "Username is not available");
    }
  };

  const signUpWithGoogle = async (credential: string | undefined) => {
    if (!credential) return;
    try {
      await loginWithGoogleCredential(credential);
      onSuccess();
    } catch {
      message.error("Google sign-in failed");
    }
  };

  return {
    submitting,
    registerWithPassword,
    validateUsernameIsFree,
    signUpWithGoogle,
  };
}
