"use client";

import { Button, Form, Input, message } from "antd";
import { GoogleLogin } from "@react-oauth/google";
import authStyles from "@/app/auth.shared.module.css";
import { useRegistration, type RegisterFormValues } from "@/hooks/useRegistration";

type RegisterFlowProps = {
  onSuccess: () => void;
  showGoogle?: boolean;
};

export function RegisterFlow({ onSuccess, showGoogle = false }: RegisterFlowProps) {
  const [form] = Form.useForm<RegisterFormValues>();

  const { submitting, registerWithPassword, signUpWithGoogle } = useRegistration({
    onSuccess,
    afterAccountCreated: () => {
      form.resetFields();
    },
  });

  return (
    <>
      {showGoogle ? (
        <>
          <div className={authStyles.googleRow}>
            <GoogleLogin
              onSuccess={(c) => void signUpWithGoogle(c.credential)}
              text="signup_with"
              onError={() => message.error("Google sign-up failed")}
            />
          </div>
          <div className={authStyles.divider}>or register with email</div>
        </>
      ) : null}

      <Form
        form={form}
        onFinish={(v) => void registerWithPassword(v)}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: "email", message: "Enter a valid email" }]}
        >
          <Input autoComplete="email" type="email" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: "Required" },
            { min: 8, message: "At least 8 characters" },
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <Form.Item
          name="confirm"
          label="Confirm password"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Confirm your password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match"));
              },
            }),
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={submitting}>
            Create account
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}
