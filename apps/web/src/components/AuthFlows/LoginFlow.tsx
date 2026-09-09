"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  type FormEvent,
} from "react";
import axios from "axios";
import authStyles from "@/app/auth.shared.module.css";
import { useGoogleOAuthAvailability } from "@/app/providers/GoogleOAuthAvailabilityProvider";
import { AuthField, GoogleSquareButton } from "@/components/AuthFlows/AuthFlowChrome";
import { ComicModalInput } from "@/components/ComicModalInput";
import { ComicPageCtaAction } from "@/components/ComicPageLayout";
import { comicToast } from "@/components/ComicToast";

export type AuthFlowHandle = {
  submit: () => void;
};

type LoginFlowProps = {
  onSuccess: () => void;
  showGoogle?: boolean;
  onGoogleSignupRequired?: () => void;
  /** Hide in-flow CTA (parent provides ComicPageDialog ctaFooter). */
  hideCta?: boolean;
  onSubmittingChange?: (submitting: boolean) => void;
};

type LoginValues = {
  email: string;
  password: string;
};

type GoogleSignupRequiredResponse = {
  error?: string;
  code?: string;
};

const logAuthDebug = (event: string, data: Record<string, unknown>) => {
  if (process.env.NODE_ENV === "production") return;
  console.info(`[auth-debug] ${event}`, data);
};

const logAxiosAuthError = (event: string, endpoint: string, error: unknown) => {
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

const notifyPasswordLoginError = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as { error?: string; code?: string };
    if (data.code === "USE_GOOGLE") {
      comicToast.warning(data.error ?? "This account uses Google sign-in.");
      return;
    }
    if (error.response.status === 429) {
      comicToast.error(data.error ?? "Too many attempts. Try again later.");
      return;
    }
  }
  comicToast.error("Invalid email or password");
};

const notifyGoogleLoginError = (
  error: unknown,
  onGoogleSignupRequired?: () => void,
) => {
  if (axios.isAxiosError(error) && error.response?.status === 409) {
    const data = error.response.data as GoogleSignupRequiredResponse;
    if (data.code === "GOOGLE_SIGNUP_REQUIRED") {
      if (onGoogleSignupRequired) {
        onGoogleSignupRequired();
      } else {
        comicToast.info("Complete account setup on the registration page.");
      }
      return;
    }
  }
  comicToast.error("Google sign-in failed");
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export const LoginFlow = forwardRef<AuthFlowHandle, LoginFlowProps>(function LoginFlow(
  {
    onSuccess,
    showGoogle = false,
    onGoogleSignupRequired,
    hideCta = false,
    onSubmittingChange,
  },
  ref,
) {
  const googleOAuthEnabled = useGoogleOAuthAvailability();
  const canShowGoogle = showGoogle && googleOAuthEnabled;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onSubmittingChange?.(submitting);
  }, [onSubmittingChange, submitting]);

  const onFinish = async (values: LoginValues) => {
    setSubmitting(true);
    try {
      await axios.post("/auth/login", values);
      setEmail("");
      setPassword("");
      onSuccess();
    } catch (e: unknown) {
      logAxiosAuthError("password_login_request_error", "/auth/login", e);
      notifyPasswordLoginError(e);
    } finally {
      setSubmitting(false);
    }
  };

  const validateAndSubmit = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      setError("Enter a valid email");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    setError(null);
    void onFinish({ email: trimmedEmail, password });
  };

  useImperativeHandle(ref, () => ({
    submit: validateAndSubmit,
  }));

  const onGoogleCredential = async (credential: string | undefined) => {
    if (!credential) {
      logAuthDebug("google_login_callback_missing_credential", {});
      return;
    }
    try {
      await axios.post("/auth/google/login", { token: credential });
      onSuccess();
    } catch (e: unknown) {
      logAxiosAuthError("google_login_request_error", "/auth/google/login", e);
      notifyGoogleLoginError(e, onGoogleSignupRequired);
    }
  };

  const onFormSubmit = (event: FormEvent) => {
    event.preventDefault();
    validateAndSubmit();
  };

  return (
    <div className={authStyles.flow}>
      {canShowGoogle ? (
        <div className={authStyles.socialBlock}>
          <GoogleSquareButton
            text="signin_with"
            onSuccess={(credential) => void onGoogleCredential(credential)}
            onError={() => comicToast.error("Google sign-in failed")}
          />
          <div className={authStyles.divider}>or sign in with email</div>
        </div>
      ) : null}

      <form className={authStyles.flowForm} onSubmit={onFormSubmit} noValidate>
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
        <AuthField>
          <ComicModalInput
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            placeholder="Password"
            aria-label="Password"
          />
        </AuthField>
        {error ? <p className={authStyles.fieldError}>{error}</p> : null}
        {!hideCta ? (
          <div className={authStyles.submitItem}>
            <ComicPageCtaAction
              label={submitting ? "Logging in" : "Login with password"}
              busy={submitting}
              disabled={submitting}
              onClick={validateAndSubmit}
            />
          </div>
        ) : null}
      </form>
    </div>
  );
});
