"use client";

import { Form, GoogleLoginButton, Input, message } from "@/components/StyledComponents";
import { UIButton } from "@/components/ui";
import authStyles from "@/app/auth.shared.module.css";
import { useRegistration, type RegisterFormValues } from "@/hooks/useRegistration";
import { useState } from "react";
import { useGoogleOAuthAvailability } from "@/app/providers/GoogleOAuthAvailabilityProvider";

type RegisterFlowProps = {
  onSuccess: () => void;
  showGoogle?: boolean;
};

export function RegisterFlow({ onSuccess, showGoogle = false }: RegisterFlowProps) {
  const googleOAuthEnabled = useGoogleOAuthAvailability();
  const [form] = Form.useForm<RegisterFormValues>();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const canShowGoogle = showGoogle && googleOAuthEnabled;

  const { submitting, registerWithPassword, signUpWithGoogle } = useRegistration({
    onSuccess,
    afterAccountCreated: () => {
      form.resetFields();
    },
  });

  return (
    <div className={authStyles.flow}>
      {canShowGoogle ? (
        <div className={authStyles.socialBlock}>
          <div className={authStyles.googleRow}>
            <GoogleLoginButton
              onSuccess={(c) => void signUpWithGoogle(c.credential)}
              text="signup_with"
              onError={() => message.error("Google sign-up failed")}
            />
          </div>
          <div className={authStyles.divider}>or register with email</div>
        </div>
      ) : null}

      <Form
        className={authStyles.flowForm}
        form={form}
        onFinish={(v) => {
          setHasSubmitted(true);
          void registerWithPassword(v);
        }}
        onFinishFailed={() => {
          setHasSubmitted(true);
        }}
        onValuesChange={(changedValues) => {
          if (!hasSubmitted) return;
          const changedFieldNames = Object.keys(changedValues) as Array<keyof RegisterFormValues>;
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
        <Form.Item
          className={authStyles.formItem}
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
          className={authStyles.formItem}
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
        <Form.Item className={authStyles.submitItem}>
          <UIButton type="submit" variant="primary" loading={submitting} className={authStyles.primaryCta}>
            {submitting ? "Creating account…" : "Create account"}
          </UIButton>
        </Form.Item>
      </Form>
    </div>
  );
}
