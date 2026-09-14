"use client";

import { Modal, Typography } from "@/components/StyledComponents";
import { ComicModalInput } from "@/components/ComicModalInput";
import { LibraryCard } from "@/components/LibraryCard";
import { useProfile } from "../ProfileContext";
import { useProfileI18n } from "@/hooks/useProfileI18n";
import { ProfileEmailPanel } from "./ProfileEmailPanel";
import styles from "./ProfileInfoTab.module.css";

export const ProfileInfoTab = () => {
  const profile = useProfile();
  const { profileInfo } = useProfileI18n();

  return (
    <>
      <div className={styles.root}>
        <LibraryCard />
        <ProfileEmailPanel />
      </div>

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
        <ComicModalInput
          value={profile.resendEmailDraft}
          onChange={(e) => profile.onResendEmailDraftChange(e.target.value)}
          placeholder={profileInfo("newEmailPlaceholder")}
        />
      </Modal>
    </>
  );
};
