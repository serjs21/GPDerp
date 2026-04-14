"use client";

import Link from "next/link";
import { Modal, Tabs, Typography } from "antd";
import { useEffect, useState } from "react";
import { LoginFlow } from "@/components/AuthFlows/LoginFlow";
import { RegisterFlow } from "@/components/AuthFlows/RegisterFlow";
import styles from "./styles.module.css";

type AuthGateModalProps = {
  open: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
  initialMode?: ViewMode;
};

type ViewMode = "login" | "register";

export function AuthGateModal({
  open,
  onClose,
  onAuthenticated,
  initialMode = "login",
}: AuthGateModalProps) {
  const [mode, setMode] = useState<ViewMode>(initialMode);

  useEffect(() => {
    if (open) setMode(initialMode);
  }, [initialMode, open]);

  return (
    <Modal
      open={open}
      title="Compose requires an account"
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      className={styles.modal}
    >
      <Typography.Paragraph type="secondary" className={styles.subtitle}>
        Sign in or create an account to compose and save haiku.
      </Typography.Paragraph>

      <Tabs
        activeKey={mode}
        onChange={(key) => setMode(key as ViewMode)}
        items={[
          {
            key: "login",
            label: "Sign in",
            children: (
              <>
                <LoginFlow
                  onSuccess={() => {
                    onAuthenticated();
                    onClose();
                  }}
                  showGoogle
                  onGoogleSignupRequired={() => {
                    setMode("register");
                  }}
                />
                <Typography.Paragraph className={styles.linkRow}>
                  <Link href="/reset_password">Forgot password?</Link>
                </Typography.Paragraph>
              </>
            ),
          },
          {
            key: "register",
            label: "Register",
            children: (
              <RegisterFlow
                onSuccess={() => {
                  onAuthenticated();
                  onClose();
                }}
                showGoogle
              />
            ),
          },
        ]}
      />
    </Modal>
  );
}
