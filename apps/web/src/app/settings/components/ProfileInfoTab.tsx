"use client";

import { useRef } from "react";
import { Modal, Typography } from "@/components/StyledComponents";
import { ComicModalInput } from "@/components/ComicModalInput";
import {
  ComicPageCtaAction,
  ComicPagePanel,
  ComicPageRow,
} from "@/components/ComicPageLayout";
import { IconUploader } from "@/components/IconUploader";
import { useProfile } from "../ProfileContext";
import { useProfileI18n } from "@/hooks/useProfileI18n";
import { ProfileEmailPanel } from "./ProfileEmailPanel";
import styles from "./ProfileInfoTab.module.css";

export const ProfileInfoTab = () => {
  const profile = useProfile();
  const { profileInfo } = useProfileI18n();
  const nameFormRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <div className={styles.root}>
        <ComicPageRow className={styles.identityRow}>
          <ComicPagePanel
            background="sunburst"
            color="magenta"
            title="You"
            contentAlign="center"
            className={styles.identityPanel}
            flexWeight={1}
            sunburstHalftone={false}
          >
            <div className={styles.identityBody}>
              <IconUploader
                iconUrl={profile.avatarUrl}
                alt={`${profile.displayName} profile icon`}
                fallbackChar={profile.displayName.slice(0, 1)}
                disabled={profile.savingAvatar}
                onUploaded={profile.onAvatarUploaded}
              />
              <p className={styles.displayName}>{profile.displayName}</p>
            </div>
          </ComicPagePanel>

          <ComicPagePanel
            background="solid"
            color="white"
            title="Name"
            contentAlign="start"
            className={styles.formPanel}
            flexWeight={1.35}
          >
            <form
              ref={nameFormRef}
              key={profile.email}
              className={styles.nameForm}
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                void profile.onSaveProfile({
                  firstName: String(data.get("firstName") ?? ""),
                  lastName: String(data.get("lastName") ?? ""),
                });
              }}
            >
              <label className={styles.field}>
                <span className={styles.fieldLabel}>{profileInfo("firstName")}</span>
                <ComicModalInput
                  name="firstName"
                  defaultValue={profile.firstName}
                  aria-label={profileInfo("firstName")}
                />
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>{profileInfo("lastName")}</span>
                <ComicModalInput
                  name="lastName"
                  defaultValue={profile.lastName}
                  aria-label={profileInfo("lastName")}
                />
              </label>
              <div className={styles.formActions}>
                <ComicPageCtaAction
                  label={profile.saveProfileLabel}
                  busy={profile.saving}
                  onClick={() => nameFormRef.current?.requestSubmit()}
                />
              </div>
            </form>
          </ComicPagePanel>
        </ComicPageRow>

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
