"use client";

import { IssuesCloseOutlined, RedoOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Modal, Space, Tooltip, Typography } from "antd";
import { IconUploader } from "@/components/IconUploader";
import { useProfile } from "../ProfileContext";
import { useProfileI18n } from "@/hooks/useProfileI18n";

export const ProfileInfoTab = () => {
  const profile = useProfile();
  const { profileInfo } = useProfileI18n();
  return (
    <>
      <Space orientation="vertical" size={16} style={{ width: "100%" }}>
        <Space size={12} align="center">
          <IconUploader
            iconUrl={profile.avatarUrl}
            alt={`${profile.displayName} profile icon`}
            fallbackChar={profile.displayName.slice(0, 1)}
            disabled={profile.savingAvatar}
            onUploaded={profile.onAvatarUploaded}
          />
          <Typography.Title level={4} style={{ margin: 0 }}>
            {profile.displayName}
          </Typography.Title>
        </Space>

        <Form
          key={profile.email}
          layout="vertical"
          initialValues={{ firstName: profile.firstName, lastName: profile.lastName }}
          onFinish={(values) => void profile.onSaveProfile(values)}
          requiredMark={false}
        >
          <Form.Item name="firstName" label={profileInfo("firstName")}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label={profileInfo("lastName")}>
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={profile.saving}>
            {profile.saveProfileLabel}
          </Button>
        </Form>

        {!profile.isGoogleUser ? (
          <Card size="small" title={profileInfo("emailTitle")}>
            <Space orientation="vertical" size={8} style={{ width: "100%" }}>
              <Typography.Text>
                {profileInfo("currentEmail")}: <strong>{profile.email}</strong>
              </Typography.Text>
              {profile.pendingEmailChange ? (
                <Space size={8}>
                  <Tooltip title={profileInfo("confirmationRequired")}>
                    <IssuesCloseOutlined />
                  </Tooltip>
                  <Typography.Text>
                    {profileInfo("pendingNewEmail")}: {profile.pendingEmailChange.newEmail}
                  </Typography.Text>
                  <Button icon={<RedoOutlined />} onClick={profile.onOpenResend}>
                    {profileInfo("resendEmail")}
                  </Button>
                </Space>
              ) : null}

              <Space.Compact style={{ width: "100%" }}>
                <Input
                  placeholder={profileInfo("newEmailPlaceholder")}
                  value={profile.emailDraft}
                  onChange={(e) => profile.onEmailDraftChange(e.target.value)}
                />
                <Button
                  type="primary"
                  disabled={!profile.validEmailDraft}
                  onClick={profile.onOpenEmailConfirm}
                >
                  {profileInfo("changeEmail")}
                </Button>
              </Space.Compact>
            </Space>
          </Card>
        ) : null}
      </Space>

      <Modal
        title={profileInfo("confirmEmailChangeTitle")}
        open={profile.emailConfirmOpen}
        onCancel={profile.onCloseEmailConfirm}
        onOk={profile.onConfirmEmailChange}
        okText={profileInfo("confirm")}
        cancelText={profileInfo("cancel")}
        confirmLoading={profile.requestingEmailChange}
        okButtonProps={{ disabled: !profile.validEmailDraft }}
      >
        <Typography.Paragraph>
          {profileInfo("confirmEmailChangeBody", { email: profile.emailDraft.trim() })}
        </Typography.Paragraph>
      </Modal>

      <Modal
        title={profileInfo("resendVerificationEmailTitle")}
        open={profile.resendOpen}
        onCancel={profile.onCloseResend}
        onOk={profile.onConfirmResend}
        okText={profileInfo("confirm")}
        cancelText={profileInfo("cancel")}
        confirmLoading={profile.resendingEmailChange}
      >
        <Typography.Paragraph>{profileInfo("resendDescription")}</Typography.Paragraph>
        <Input
          value={profile.resendEmailDraft}
          onChange={(e) => profile.onResendEmailDraftChange(e.target.value)}
          placeholder={profileInfo("newEmailPlaceholder")}
        />
      </Modal>
    </>
  );
};
