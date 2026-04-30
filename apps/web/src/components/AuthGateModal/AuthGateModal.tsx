"use client";

import Link from "next/link";
import { Modal, Tabs, Typography } from "@/components/StyledComponents";
import { useState } from "react";
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
  return (
    <Modal
      open={open}
      title="Compose requires an account"
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      className={styles.modal}
    >
      {open ? (
        <AuthGateModalInner
          key={initialMode}
          initialMode={initialMode}
          onClose={onClose}
          onAuthenticated={onAuthenticated}
        />
      ) : null}
    </Modal>
  );
}

type AuthGateModalInnerProps = {
  initialMode: ViewMode;
  onClose: () => void;
  onAuthenticated: () => void;
};

function AuthGateModalInner({ initialMode, onClose, onAuthenticated }: AuthGateModalInnerProps) {
  const [mode, setMode] = useState<ViewMode>(initialMode);

  return (
    <>
      <Typography.Paragraph type="secondary" className={styles.subtitle}>
        Sign in or create an account to compose and save haiku.
      </Typography.Paragraph>

      <Tabs
        activeKey={mode}
        onChange={(key: string) => setMode(key as ViewMode)}
        items={[
          {
            key: "login",
            label: "Sign in",
            children: (
              <div className={styles.tabContent}>
                <div className={styles.tabFlow}>
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
                </div>
                <Typography.Paragraph className={styles.linkRow}>
                  <Link href="/reset_password">Forgot password?</Link>
                </Typography.Paragraph>
              </div>
            ),
          },
          {
            key: "register",
            label: "Register",
            children: (
              <div className={styles.tabContent}>
                <div className={styles.tabFlow}>
                  <RegisterFlow
                    onSuccess={() => {
                      onAuthenticated();
                      onClose();
                    }}
                    showGoogle
                  />
                </div>
                <Typography.Paragraph className={styles.linkRow}>
                  <Link href="/reset_password">Forgot password?</Link>
                </Typography.Paragraph>
              </div>
            ),
          },
        ]}
      />
    </>
  );
}
