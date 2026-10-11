"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { Typography } from "@/components/StyledComponents";
import {
  ComicPageDialog,
  ComicPagePanel,
} from "@/components/ComicPageLayout";
import { ComicPanelTabs } from "@/components/ComicPanelTabs";
import type { HaikuDto } from "@/api/haikus";
import type { ShareLinkListItem } from "@/api/shareLinks";
import { ShareLink } from "@/components/ShareLink/ShareLink";
import { useShareLinkSocket } from "@/hooks/useShareLinkSocket";
import { SendShareEmailContent } from "./SendShareEmailContent";
import { ShareEmailSendPanel } from "./ShareEmailSendPanel";
import { ShareMethodIcon } from "./ShareMethodIcon";
import styles from "./ShareModal.module.css";
import type { ShareMethod } from "./types";
import { useShareModalController } from "./useShareModalController";

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

const EMPTY_EMAIL_RECIPIENTS: string[] = [];

export function ShareModal({
  open,
  onClose,
  haikuId,
  haikuSubject: haikuSubjectProp,
  haiku = null,
  initialCreatedUrl = null,
  initialCreatedLink = null,
  initialEmptyLink = false,
  initialMethod = "link",
  initialEmailRecipients = EMPTY_EMAIL_RECIPIENTS,
}: ShareModalProps) {
  const t = useTranslations("ShareModal.modal");
  const haikuSubject = haikuSubjectProp ?? t("defaultSubject");
  const {
    method,
    setMethod,
    shareLink,
    setShareLink,
    loadingLink,
    emailMessage,
    setEmailMessage,
    emailRecipients,
    setEmailRecipients,
    sendingEmail,
    preparingPostcard,
    invalidEmails,
    canSendEmail,
    emailCtaHint,
    onSendEmail,
  } = useShareModalController({
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

  const onShareLinkSocketUpdate = useCallback(
    (updated: ShareLinkListItem) => {
      setShareLink((prev) => {
        if (updated.sharedHaikuId === haikuId) return { ...prev, ...updated };
        if (prev?.id === updated.id) return { ...prev, ...updated };
        return prev;
      });
    },
    [haikuId, setShareLink],
  );

  const onShareLinkSocketDeleted = useCallback(
    (id: string) => {
      setShareLink((prev) => (prev?.id === id ? null : prev));
    },
    [setShareLink],
  );

  useShareLinkSocket(open, {
    onShareLink: onShareLinkSocketUpdate,
    onShareLinkDeleted: onShareLinkSocketDeleted,
  });

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
        <ComicPanelTabs
          className={styles.methodRow}
          panelClassName={styles.methodPanel}
          value={method}
          onChange={setMethod}
          tabs={[
            {
              id: "link",
              panel: {
                background: "sunburst",
                color: "teal",
                title: t("linkTabTitle"),
                ariaLabel: t("linkTabAriaLabel"),
              },
              content: (
                <ShareMethodIcon
                  src="/share_modal/link.svg"
                  bubbleStyle="pointedArcs"
                  sourceDirection="none"
                  active={method === "link"}
                />
              ),
            },
            {
              id: "email",
              panel: {
                background: "halftone",
                color: "orange",
                title: t("emailTabTitle"),
                ariaLabel: t("emailTabAriaLabel"),
              },
              content: (
                <ShareMethodIcon
                  src="/share_modal/email.svg"
                  bubbleStyle="rectangle"
                  sourceDirection="none"
                  active={method === "email"}
                />
              ),
            },
          ]}
        />

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
            <div className={styles.pane} data-active>
              <div className={styles.contentSlot}>
                <ComicPagePanel span="full" color="white" contentAlign="start" className={styles.contentPanel}>
                  <SendShareEmailContent
                    message={emailMessage}
                    emails={emailRecipients}
                    invalidEmails={invalidEmails}
                    onMessageChange={setEmailMessage}
                    onEmailsChange={setEmailRecipients}
                    disabled={sendingEmail}
                  />
                </ComicPagePanel>
              </div>
              <div className={styles.sendRow}>
                <ShareEmailSendPanel
                  canSendEmail={canSendEmail}
                  sendingEmail={sendingEmail}
                  preparingPostcard={preparingPostcard}
                  emailCtaHint={emailCtaHint}
                  onSendEmail={() => void onSendEmail()}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </ComicPageDialog>
  );
}
