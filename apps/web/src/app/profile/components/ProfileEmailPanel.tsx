"use client";

import { IssuesCloseOutlined, RedoOutlined } from "@ant-design/icons";
import { Tooltip } from "@/components/StyledComponents";
import { ComicModalInput } from "@/components/ComicModalInput";
import { ComicPageCtaAction, ComicPagePanel } from "@/components/ComicPageLayout";
import { useProfile } from "../ProfileContext";
import { useProfileI18n } from "@/hooks/useProfileI18n";
import styles from "./ProfileInfoTab.module.css";

export function ProfileEmailPanel() {
  const profile = useProfile();
  const { profileInfo } = useProfileI18n();

  if (profile.isGoogleUser) return null;

  return (
    <ComicPagePanel
      span="full"
      background="halftone"
      color="teal"
      title={profileInfo("emailTitle")}
      contentAlign="start"
      className={styles.emailPanel}
    >
      <div className={styles.emailBody}>
        <p className={styles.emailLine}>
          {profileInfo("currentEmail")}: <strong>{profile.email}</strong>
        </p>
        {profile.pendingEmailChange ? (
          <div className={styles.pendingRow}>
            <Tooltip title={profileInfo("confirmationRequired")}>
              <IssuesCloseOutlined />
            </Tooltip>
            <span>
              {profileInfo("pendingNewEmail")}: {profile.pendingEmailChange.newEmail}
            </span>
            <button type="button" className={styles.textButton} onClick={profile.onOpenResend}>
              <RedoOutlined /> {profileInfo("resendEmail")}
            </button>
          </div>
        ) : null}
        <div className={styles.emailChangeRow}>
          <ComicModalInput
            placeholder={profileInfo("newEmailPlaceholder")}
            value={profile.emailDraft}
            onChange={(e) => profile.onEmailDraftChange(e.target.value)}
            aria-label={profileInfo("newEmailPlaceholder")}
          />
          <ComicPageCtaAction
            label={profileInfo("changeEmail")}
            disabled={!profile.validEmailDraft}
            onClick={profile.onOpenEmailConfirm}
          />
        </div>
      </div>
    </ComicPagePanel>
  );
}
