import axios from "axios";
import { comicToast } from "@/components/ComicToast";

type Translate = (key: string, values?: Record<string, string | number>) => string;

type GoogleSignupRequiredResponse = {
  error?: string;
  code?: string;
};

export const logAuthDebug = (event: string, data: Record<string, unknown>) => {
  if (process.env.NODE_ENV === "production") return;
  console.info(`[auth-debug] ${event}`, data);
};

export const logAxiosAuthError = (event: string, endpoint: string, error: unknown) => {
  if (axios.isAxiosError(error)) {
    logAuthDebug(event, {
      endpoint: String(error.config?.url ?? endpoint),
      status: error.response?.status ?? null,
      code: (error.response?.data as { code?: string } | undefined)?.code ?? null,
      error: (error.response?.data as { error?: string } | undefined)?.error ?? null,
    });
    return;
  }
  logAuthDebug(event, { endpoint, nonAxiosError: true });
};

export const notifyPasswordLoginError = (error: unknown, t: Translate) => {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as { error?: string; code?: string };
    if (data.code === "USE_GOOGLE") {
      comicToast.warning(data.error ?? t("useGoogleSignIn"));
      return;
    }
    if (error.response.status === 429) {
      comicToast.error(data.error ?? t("tooManyAttempts"));
      return;
    }
  }
  comicToast.error(t("invalidCredentials"));
};

export const notifyGoogleLoginError = (
  error: unknown,
  t: Translate,
  onGoogleSignupRequired?: () => void,
) => {
  if (axios.isAxiosError(error) && error.response?.status === 409) {
    const data = error.response.data as GoogleSignupRequiredResponse;
    if (data.code === "GOOGLE_SIGNUP_REQUIRED") {
      if (onGoogleSignupRequired) {
        onGoogleSignupRequired();
      } else {
        comicToast.info(t("completeSetupOnRegistration"));
      }
      return;
    }
  }
  comicToast.error(t("googleSignInFailed"));
};
