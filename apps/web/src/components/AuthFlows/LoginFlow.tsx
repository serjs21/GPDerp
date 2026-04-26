"use client";

import { Form, GoogleLoginButton, Input, message } from "@/components/StyledComponents";
import { UIButton } from "@/components/ui";
import axios from "axios";
import authStyles from "@/app/auth.shared.module.css";
import { useState } from "react";
import { useGoogleOAuthAvailability } from "@/app/providers/GoogleOAuthAvailabilityProvider";

type LoginFlowProps = {
  onSuccess: () => void;
  showGoogle?: boolean;
  onGoogleSignupRequired?: () => void;
};

type LoginValues = {
  email: string;
  password: string;
};

const logAuthDebug = (event: string, data: Record<string, unknown>) => {
  if (process.env.NODE_ENV === "production") return;
  console.info(`[auth-debug] ${event}`, data);
};

type GoogleSignupRequiredResponse = {
  error?: string;
  code?: string;
};

export function LoginFlow({
  onSuccess,
  showGoogle = false,
  onGoogleSignupRequired,
}: LoginFlowProps) {
  const googleOAuthEnabled = useGoogleOAuthAvailability();
  const [form] = Form.useForm<LoginValues>();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const canShowGoogle = showGoogle && googleOAuthEnabled;

  const onFinish = async (values: LoginValues) => {
    try {
      await axios.post("/auth/login", values);
      onSuccess();
      form.resetFields();
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        logAuthDebug("password_login_request_error", {
          endpoint: String(e.config?.url ?? "/auth/login"),
          status: e.response?.status ?? null,
          code: (e.response?.data as { code?: string } | undefined)?.code ?? null,
          error: (e.response?.data as { error?: string } | undefined)?.error ?? null,
        });
      } else {
        logAuthDebug("password_login_request_error", {
          endpoint: "/auth/login",
          nonAxiosError: true,
        });
      }
      if (axios.isAxiosError(e) && e.response?.data) {
        const data = e.response.data as { error?: string; code?: string };
        if (data.code === "USE_GOOGLE") {
          message.warning(data.error ?? "This account uses Google sign-in.");
          return;
        }
        if (e.response.status === 429) {
          message.error(data.error ?? "Too many attempts. Try again later.");
          return;
        }
      }
      message.error("Invalid email or password");
    }
  };

  const onGoogleCredential = async (credential: string | undefined) => {
    if (!credential) {
      logAuthDebug("google_login_callback_missing_credential", {});
      return;
    }
    try {
      await axios.post("/auth/google/login", { token: credential });
      onSuccess();
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        logAuthDebug("google_login_request_error", {
          endpoint: String(e.config?.url ?? "/auth/google/login"),
          status: e.response?.status ?? null,
          code: (e.response?.data as { code?: string } | undefined)?.code ?? null,
          error: (e.response?.data as { error?: string } | undefined)?.error ?? null,
        });
      } else {
        logAuthDebug("google_login_request_error", {
          endpoint: "/auth/google/login",
          nonAxiosError: true,
        });
      }
      if (axios.isAxiosError(e) && e.response?.status === 409) {
        const data = e.response.data as GoogleSignupRequiredResponse;
        if (data.code === "GOOGLE_SIGNUP_REQUIRED") {
          if (onGoogleSignupRequired) {
            onGoogleSignupRequired();
          } else {
            message.info("Complete account setup on the registration page.");
          }
          return;
        }
      }
      message.error("Google sign-in failed");
    }
  };

  return (
    <div className={authStyles.flow}>
      {canShowGoogle ? (
        <div className={authStyles.socialBlock}>
          <div className={authStyles.googleRow}>
            <GoogleLoginButton
              onSuccess={(c) => void onGoogleCredential(c.credential)}
              onError={() => message.error("Google sign-in failed")}
              text="signin_with"
            />
          </div>
          <div className={authStyles.divider}>or sign in with email</div>
        </div>
      ) : null}

      <Form
        className={authStyles.flowForm}
        form={form}
        onFinish={(values) => {
          setHasSubmitted(true);
          void onFinish(values);
        }}
        onFinishFailed={() => {
          setHasSubmitted(true);
        }}
        onValuesChange={(changedValues) => {
          if (!hasSubmitted) return;
          const changedFieldNames = Object.keys(changedValues) as Array<keyof LoginValues>;
          form.setFields(
            changedFieldNames.map((fieldName) => ({
              name: fieldName,
              errors: [],
            })),
          );
          setHasSubmitted(false);
        }}
        layout="vertical"
        requiredMark={false}
        validateTrigger={false}
        onKeyDown={(event) => {
          if (event.key !== "Enter" || event.shiftKey) return;
          event.preventDefault();
          void form.submit();
        }}
      >
        <Form.Item
          className={authStyles.formItem}
          name="email"
          label="Email"
          rules={[{ required: true, type: "email", message: "Enter a valid email" }]}
        >
          <Input autoComplete="email" type="email" />
        </Form.Item>
        <Form.Item className={authStyles.formItem} name="password" label="Password" rules={[{ required: true, message: "Required" }]}>
          <Input.Password autoComplete="current-password" />
        </Form.Item>
        <Form.Item className={`${authStyles.formItem} ${authStyles.hiddenMirrorRow}`} label="Confirm password">
          <Input.Password autoComplete="off" disabled />
        </Form.Item>
        <Form.Item className={authStyles.submitItem}>
          <UIButton type="submit" variant="primary" className={authStyles.primaryCta}>
            Sign in
          </UIButton>
        </Form.Item>
      </Form>
    </div>
  );
}
