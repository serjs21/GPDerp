"use client";

import { IssuesCloseOutlined, RedoOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Form, Input, Modal, Space, Tooltip, Typography, message } from "antd";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { AuthProvider } from "@/types";
import { isValidEmail } from "@/utils/strings";
import {
  fetchOwnProfile,
  requestEmailChange,
  resendEmailChange,
  updateOwnProfile,
  type UserProfileResponse,
} from "@/api/user";
import { IconUploader } from "@/components/IconUploader";

export default function ProfilePage() {
  const router = useRouter();
  const { initialized, isLoggedIn, checkAuthentication } = useAuthenticationState();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [emailDraft, setEmailDraft] = useState("");
  const [emailConfirmOpen, setEmailConfirmOpen] = useState(false);
  const [resendOpen, setResendOpen] = useState(false);
  const [resendEmailDraft, setResendEmailDraft] = useState("");
  const [requestingEmailChange, setRequestingEmailChange] = useState(false);
  const [resendingEmailChange, setResendingEmailChange] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const avatarDraft = Form.useWatch("avatar", form) as string | undefined;

  useEffect(() => {
    if (!initialized) return;
    if (!isLoggedIn) router.replace("/");
  }, [initialized, isLoggedIn, router]);
 
  const validEmailDraft = useMemo(() => isValidEmail(emailDraft), [emailDraft]);


  useEffect(() => {
    if (!initialized || !isLoggedIn) return;
    setLoading(true);
    void fetchOwnProfile()
      .then((data) => {
        setProfile(data);
        form.setFieldsValue({
          firstName: data.firstName,
          lastName: data.lastName,
          avatar: data.avatar,
          email: data.email,
        });
      })
      .catch(() => {
        message.error("Could not load profile");
      })
      .finally(() => setLoading(false));
  }, [form, initialized, isLoggedIn]);

  if (!initialized || !isLoggedIn) return null;
  if (loading || !profile) return null;

  const displayName = profile.userName || profile.email || "User";
  const isGoogleUser = profile.providers.includes(AuthProvider.GOOGLE);
  const pendingNewEmail = profile.pendingEmailChange?.newEmail ?? null;

  const onSaveProfile = async (values: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  }) => {
    try {
      setSaving(true);
      const updated = await updateOwnProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        avatar: values.avatar,
      });
      setProfile(updated);
      message.success("Profile updated");
      checkAuthentication();
    } catch {
      message.error("Could not update profile");
    } finally {
      setSaving(false);
    }
  };


  const createEmailChange = async () => {
    try {
      setRequestingEmailChange(true);
      const result = await requestEmailChange(emailDraft.trim());
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              pendingEmailChange: {
                newEmail: result.pendingEmail,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                requestedAt: new Date().toISOString(),
              },
            }
          : prev,
      );
      setEmailConfirmOpen(false);
      message.success("Email change verification sent");
    } catch {
      message.error("Could not create email change request");
    } finally {
      setRequestingEmailChange(false);
    }
  };

  const resendChange = async () => {
    try {
      setResendingEmailChange(true);
      const result = await resendEmailChange(resendEmailDraft.trim() || undefined);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              pendingEmailChange: {
                newEmail: result.pendingEmail,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                requestedAt: new Date().toISOString(),
              },
            }
          : prev,
      );
      setResendOpen(false);
      message.success("Verification email sent");
    } catch {
      message.error("Could not resend verification email");
    } finally {
      setResendingEmailChange(false);
    }
  };

  return (
    <main
      style={{
        flex: 1,
        minHeight: 0,
        width: "100%",
        maxWidth: 720,
        margin: "24px auto",
        padding: "0 16px",
        boxSizing: "border-box",
      }}
    >
      <Card title="Profile">
        <Space orientation="vertical" size={16} style={{ width: "100%" }}>
          <Space size={12} align="center">
            <IconUploader
              iconUrl={avatarDraft || profile.avatar}
              alt={`${displayName} profile icon`}
              fallbackChar={displayName.slice(0, 1)}
              disabled={savingAvatar}
              onUploaded={({ publicUrl }) => {
                form.setFieldValue("avatar", publicUrl);
                setProfile((prev) => (prev ? { ...prev, avatar: publicUrl, avatarManuallySet: true } : prev));
                void (async () => {
                  try {
                    setSavingAvatar(true);
                    const updated = await updateOwnProfile({ avatar: publicUrl });
                    setProfile(updated);
                    message.success("Profile picture saved");
                    checkAuthentication();
                  } catch {
                    message.error("Could not save profile picture to your account");
                  } finally {
                    setSavingAvatar(false);
                  }
                })();
              }}
            />
            <Typography.Title level={4} style={{ margin: 0 }}>
              {displayName}
            </Typography.Title>
          </Space>

          <Form
            form={form}
            layout="vertical"
            onFinish={(values) => void onSaveProfile(values)}
            requiredMark={false}
          >
            <Form.Item name="avatar" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="firstName" label="First name">
              <Input />
            </Form.Item>
            <Form.Item name="lastName" label="Last name">
              <Input />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={saving}>
              Save profile
            </Button>
          </Form>

          {!isGoogleUser ? (
            <Card size="small" title="Email">
              <Space direction="vertical" size={8} style={{ width: "100%" }}>
                <Typography.Text>
                  Current email: <strong>{profile.email}</strong>
                </Typography.Text>
                {pendingNewEmail ? (
                  <Space size={8}>
                    <Tooltip title="Confirmation required">
                      <IssuesCloseOutlined />
                    </Tooltip>
                    <Typography.Text>Pending new email: {pendingNewEmail}</Typography.Text>
                    <Button
                      icon={<RedoOutlined />}
                      onClick={() => {
                        setResendEmailDraft(pendingNewEmail);
                        setResendOpen(true);
                      }}
                    >
                      Resend email
                    </Button>
                  </Space>
                ) : null}

                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    placeholder="new@email.com"
                    value={emailDraft}
                    onChange={(e) => setEmailDraft(e.target.value)}
                  />
                  <Button
                    type="primary"
                    disabled={!validEmailDraft}
                    onClick={() => setEmailConfirmOpen(true)}
                  >
                    Change email
                  </Button>
                </Space.Compact>
              </Space>
            </Card>
          ) : null}
        </Space>
      </Card>

      <Modal
        title="Confirm email change"
        open={emailConfirmOpen}
        onCancel={() => setEmailConfirmOpen(false)}
        onOk={() => void createEmailChange()}
        okText="Confirm"
        cancelText="Cancel"
        confirmLoading={requestingEmailChange}
        okButtonProps={{ disabled: !validEmailDraft }}
      >
        <Typography.Paragraph>
          Email verification will be required for <strong>{emailDraft.trim()}</strong>.
        </Typography.Paragraph>
      </Modal>

      <Modal
        title="Resend verification email"
        open={resendOpen}
        onCancel={() => setResendOpen(false)}
        onOk={() => void resendChange()}
        okText="Confirm"
        cancelText="Cancel"
        confirmLoading={resendingEmailChange}
        okButtonProps={{
          disabled: !isValidEmail(resendEmailDraft),
        }}
      >
        <Typography.Paragraph>
          You can change the target email before resending.
        </Typography.Paragraph>
        <Input
          value={resendEmailDraft}
          onChange={(e) => setResendEmailDraft(e.target.value)}
          placeholder="new@email.com"
        />
      </Modal>
    </main>
  );
}
