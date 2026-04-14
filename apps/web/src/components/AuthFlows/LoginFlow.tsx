"use client";

import { Button, Form, Input, message } from "antd";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import authStyles from "@/app/auth.shared.module.css";

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
  const [form] = Form.useForm<LoginValues>();

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
    <>
      <Form form={form} onFinish={onFinish} layout="vertical" requiredMark={false}>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: "email", message: "Enter a valid email" }]}
        >
          <Input autoComplete="email" type="email" />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true, message: "Required" }]}>
          <Input.Password autoComplete="current-password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Sign in
          </Button>
        </Form.Item>
      </Form>
      {showGoogle ? (
        <>
          <div className={authStyles.divider}>or</div>
          <div className={authStyles.googleRow}>
            <GoogleLogin
              onSuccess={(c) => void onGoogleCredential(c.credential)}
              onError={() => message.error("Google sign-in failed")}
            />
          </div>
        </>
      ) : null}
    </>
  );
}
