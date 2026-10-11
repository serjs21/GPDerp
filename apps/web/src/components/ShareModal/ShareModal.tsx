"use client";

import { useTranslations } from "next-intl";
import { Typography } from "@/components/StyledComponents";
import {
  ComicPageDialog,
  ComicPagePanel,
} from "@/components/ComicPageLayout";
import type { HaikuDto } from "@/api/haikus";
import type { ShareLinkListItem } from "@/api/shareLinks";
import { ShareLink } from "@/components/ShareLink/ShareLink";
import { ShareModalEmailPane } from "./ShareModalEmailPane";
import { ShareModalMethodTabs } from "./ShareModalMethodTabs";
import styles from "./ShareModal.module.css";
import type { ShareMethod } from "./types";
import { useShareModalController } from "./useShareModalController";
import { useShareModalLinkSocket } from "./useShareModalLinkSocket";

export type { LinkPolicy, ShareMethod } from "./types";

export type ShareModalProps = {
  open: boolean;
  onClose: () => void;
  haikuId: string;
  /** Display title for the ShareLink row. */
  haikuSubject?: string;
  /** Full haiku when already loaded (lantern actions); used for share preview. */
  haiku?: HaikuDto | null;
  /** When the modal opens, start with a created link (for Storybook). */
  initialCreatedUrl?: string | null;
  /** Prefer full link object when available (Storybook / resume). */
  initialCreatedLink?: ShareLinkListItem | null;
  /** Skip fetch and show empty ShareLink (Storybook). */
  initialEmptyLink?: boolean;
  /** When the modal opens, pre-select a share method (for Storybook). */
  initialMethod?: ShareMethod;
  /** When the modal opens, pre-fill recipient emails (for Storybook). */
  initialEmailRecipients?: string[];
};

export function ShareModal({
  open,
  onClose,
  haikuId,
  haikuSubject: haikuSubjectProp,
  haiku,
  initialCreatedUrl,
  initialCreatedLink,
  initialEmptyLink,
  initialMethod,
  initialEmailRecipients,
}: ShareModalProps) {
  const t = useTranslations("ShareModal.modal");
  const haikuSubject = haikuSubjectProp ?? t("defaultSubject");
  const controller = useShareModalController({
    open,
    haikuId,
    haiku,
    haikuSubject,
    initialCreatedUrl,
    initialCreatedLink,
    initialEmptyLink,
    initialMethod,
    initialEmailRecipients,
    onEmailQueued: onClose,
  });
  const { method, setMethod, shareLink, setShareLink, loadingLink } = controller;
  useShareModalLinkSocket(open, haikuId, setShareLink);

  return (
    <ComicPageDialog
      open={open}
      showClose
      contentClassName={styles.dialogContent}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <div className={styles.body}>
        <ShareModalMethodTabs method={method} onChange={setMethod} />

        {/* Both tabs share one grid cell; the link pane stays mounted (hidden) so the email tab takes its height. */}
        <div className={styles.panes}>
          <div
            className={styles.pane}
            data-active={method === "link"}
            inert={method !== "link"}
            aria-hidden={method !== "link"}
          >
            <div className={styles.contentSlot}>
              {loadingLink ? (
                <ComicPagePanel span="full" color="white" contentAlign="center" className={styles.contentPanel}>
                  <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
                    {t("loading")}
                  </Typography.Paragraph>
                </ComicPagePanel>
              ) : (
                <ShareLink
                  link={shareLink}
                  haikuId={haikuId}
                  haikuSubject={haikuSubject}
                  haiku={haiku}
                  onChanged={() => undefined}
                  onLinkUpdate={setShareLink}
                />
              )}
            </div>
          </div>

          {method === "email" ? (
            <ShareModalEmailPane
              content={{
                message: controller.emailMessage,
                emails: controller.emailRecipients,
                invalidEmails: controller.invalidEmails,
                onMessageChange: controller.setEmailMessage,
                onEmailsChange: controller.setEmailRecipients,
                disabled: controller.sendingEmail,
              }}
              send={{
                canSendEmail: controller.canSendEmail,
                sendingEmail: controller.sendingEmail,
                preparingPostcard: controller.preparingPostcard,
                emailCtaHint: controller.emailCtaHint,
                onSendEmail: () => void controller.onSendEmail(),
              }}
            />
          ) : null}
        </div>
      </div>
    </ComicPageDialog>
  );
}
